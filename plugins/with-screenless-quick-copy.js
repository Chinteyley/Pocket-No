const fs = require('fs');
const path = require('path');
const pbxFile = require('xcode/lib/pbxFile');

const {
  createRunOncePlugin,
  withDangerousMod,
  withXcodeProject,
} = require('expo/config-plugins');

const PLUGIN_NAME = 'with-screenless-quick-copy';
const WIDGET_TARGET_NAME = 'ExpoWidgetsTarget';
const SHORTCUTS_TARGET_PATH = path.join('targets', 'pocket-no-shortcuts');
const COPY_HELPER_FILENAME = 'copy-no-action.swift';
const REASON_CATALOG_FILENAME = 'reason.json';
const CUSTOM_WIDGET_SWIFT_PATH = path.join('plugins', 'ios', 'PocketNoWidget.swift');

function ensureTargetDeploymentTarget(project, targetName, deploymentTarget) {
  const target = project.pbxTargetByName(targetName);
  if (!target) {
    return;
  }

  const configurationLists = project.pbxXCConfigurationList();
  const buildConfigurations = project.pbxXCBuildConfigurationSection();
  const targetConfigurationList = configurationLists[target.buildConfigurationList];

  if (!targetConfigurationList?.buildConfigurations) {
    return;
  }

  for (const buildConfiguration of targetConfigurationList.buildConfigurations) {
    const configuration = buildConfigurations[buildConfiguration.value];
    if (!configuration?.buildSettings) {
      continue;
    }

    configuration.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = deploymentTarget;
  }
}

/**
 * Find a target's build phase of a given type by walking its buildPhases array,
 * bypassing the comment-based lookup in the xcode library which fails when
 * the phase was created with a non-standard comment (e.g. expo-widgets uses
 * "Embed Foundation Extensions" instead of "Sources").
 */
function findBuildPhase(project, targetUuid, phaseType) {
  const target = project.pbxNativeTargetSection()[targetUuid];
  if (!target?.buildPhases) {
    return null;
  }

  const section = project.hash.project.objects[phaseType];
  if (!section) {
    return null;
  }

  for (const bp of target.buildPhases) {
    if (section[bp.value]) {
      return section[bp.value];
    }
  }
  return null;
}

/**
 * Add a file to a specific target's build phase, PBXGroup, and file
 * reference/build file sections. Bypasses Expo's addBuildSourceFileToGroup /
 * addResourceFileToGroup which route to the wrong target when the phase was
 * created with a non-standard comment.
 */
function addFileToTarget(project, { filepath, groupName, targetUuid, phaseType, phaseLabel }) {
  const group = project.pbxGroupByName(groupName);
  if (!group) {
    return;
  }

  const file = new pbxFile(path.basename(filepath));

  // Skip if already in the group
  if (group.children.some((child) => child.comment === file.basename)) {
    return;
  }

  file.uuid = project.generateUuid();
  file.fileRef = project.generateUuid();
  file.target = targetUuid;

  project.addToPbxFileReferenceSection(file);
  project.addToPbxBuildFileSection(file);

  const phase = findBuildPhase(project, targetUuid, phaseType);
  if (phase) {
    phase.files.push({
      value: file.uuid,
      comment: `${file.basename} in ${phaseLabel}`,
    });
  }

  group.children.push({
    value: file.fileRef,
    comment: file.basename,
  });
}

const withGeneratedScreenlessQuickCopyFiles = (config) =>
  withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosRoot = config.modRequest.platformProjectRoot;
      const shortcutsTargetRoot = path.join(projectRoot, SHORTCUTS_TARGET_PATH);
      const widgetTargetRoot = path.join(iosRoot, WIDGET_TARGET_NAME);
      const rootReasonCatalogPath = path.join(projectRoot, REASON_CATALOG_FILENAME);
      const shortcutReasonCatalogPath = path.join(shortcutsTargetRoot, REASON_CATALOG_FILENAME);
      const widgetReasonCatalogPath = path.join(widgetTargetRoot, REASON_CATALOG_FILENAME);
      const helperSourcePath = path.join(shortcutsTargetRoot, COPY_HELPER_FILENAME);
      const widgetHelperPath = path.join(widgetTargetRoot, COPY_HELPER_FILENAME);
      const widgetSwiftTemplatePath = path.join(projectRoot, CUSTOM_WIDGET_SWIFT_PATH);
      const widgetSwiftPath = path.join(widgetTargetRoot, 'PocketNoWidget.swift');

      fs.mkdirSync(widgetTargetRoot, { recursive: true });
      fs.copyFileSync(rootReasonCatalogPath, shortcutReasonCatalogPath);
      fs.copyFileSync(rootReasonCatalogPath, widgetReasonCatalogPath);
      fs.copyFileSync(helperSourcePath, widgetHelperPath);
      fs.copyFileSync(widgetSwiftTemplatePath, widgetSwiftPath);

      return config;
    },
  ]);

const withWidgetQuickCopyXcode = (config) =>
  withXcodeProject(config, (config) => {
    const project = config.modResults;
    const widgetTargetUuid = project.findTargetKey(WIDGET_TARGET_NAME);

    if (!widgetTargetUuid) {
      return config;
    }

    addFileToTarget(project, {
      filepath: COPY_HELPER_FILENAME,
      groupName: WIDGET_TARGET_NAME,
      targetUuid: widgetTargetUuid,
      phaseType: 'PBXSourcesBuildPhase',
      phaseLabel: 'Sources',
    });

    addFileToTarget(project, {
      filepath: REASON_CATALOG_FILENAME,
      groupName: WIDGET_TARGET_NAME,
      targetUuid: widgetTargetUuid,
      phaseType: 'PBXResourcesBuildPhase',
      phaseLabel: 'Resources',
    });

    ensureTargetDeploymentTarget(project, WIDGET_TARGET_NAME, '17.0');
    ensureTargetDeploymentTarget(project, 'PocketNoShortcuts', '18.0');

    return config;
  });

const withScreenlessQuickCopy = (config) => {
  config = withGeneratedScreenlessQuickCopyFiles(config);
  config = withWidgetQuickCopyXcode(config);
  return config;
};

module.exports = createRunOncePlugin(withScreenlessQuickCopy, PLUGIN_NAME, '1.0.0');
