const fs = require('fs');
const path = require('path');

const {
  IOSConfig,
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
    const widgetTarget = project.pbxTargetByName(WIDGET_TARGET_NAME);

    if (!widgetTarget) {
      return config;
    }

    IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
      filepath: `${WIDGET_TARGET_NAME}/${COPY_HELPER_FILENAME}`,
      groupName: WIDGET_TARGET_NAME,
      project,
      targetUuid: widgetTarget.uuid,
      verbose: true,
    });

    IOSConfig.XcodeUtils.addResourceFileToGroup({
      filepath: `${WIDGET_TARGET_NAME}/${REASON_CATALOG_FILENAME}`,
      groupName: WIDGET_TARGET_NAME,
      isBuildFile: true,
      project,
      targetUuid: widgetTarget.uuid,
      verbose: true,
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
