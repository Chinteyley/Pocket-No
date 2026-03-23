const pbxFile = require('xcode/lib/pbxFile');

const {
  createRunOncePlugin,
  withXcodeProject,
} = require('expo/config-plugins');

const PLUGIN_NAME = 'with-screenless-quick-copy';
const MAIN_APP_TARGET_NAME = 'PocketNo';
const SHORTCUTS_TARGET_NAME = 'PocketNoShortcuts';
const SHARED_NATIVE_GROUP_NAME = 'PocketNoNative';
const SHORTCUTS_TARGET_PATH = 'targets/pocket-no-shortcuts';
const COPY_HELPER_FILENAME = 'copy-no-action.swift';
const COPY_SHORTCUT_FILENAME = 'CopyNoShortcut.swift';
const REASON_CATALOG_FILENAME = 'reason.json';
const COPY_HELPER_SOURCE_PATH = `../${SHORTCUTS_TARGET_PATH}/${COPY_HELPER_FILENAME}`;
const REASON_CATALOG_SOURCE_PATH = `../${REASON_CATALOG_FILENAME}`;
const COPY_SHORTCUT_SOURCE_PATH = `../plugins/ios/${COPY_SHORTCUT_FILENAME}`;

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
 * the phase was created with a non-standard comment.
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

function ensureBuildPhase(project, targetUuid, phaseType, phaseLabel) {
  if (findBuildPhase(project, targetUuid, phaseType)) {
    return;
  }

  project.addBuildPhase([], phaseType, phaseLabel, targetUuid);
}

function findGroupKeyByName(project, groupName) {
  const groups = project.hash.project.objects.PBXGroup ?? {};

  for (const key of Object.keys(groups)) {
    if (!key.endsWith('_comment')) {
      continue;
    }

    if (groups[key] === groupName) {
      return key.replace(/_comment$/, '');
    }
  }

  return null;
}

function ensureGroup(project, groupName) {
  const existingGroupKey = findGroupKeyByName(project, groupName);
  if (existingGroupKey) {
    return existingGroupKey;
  }

  const groupKey = project.pbxCreateGroup(groupName);
  const rootGroupKey = project.getFirstProject().firstProject.mainGroup;
  project.addToPbxGroup(groupKey, rootGroupKey);

  return groupKey;
}

function findFileReference(project, filepath) {
  const fileReferences = project.pbxFileReferenceSection();

  for (const key of Object.keys(fileReferences)) {
    if (key.endsWith('_comment')) {
      continue;
    }

    const fileReference = fileReferences[key];
    if (fileReference?.path === filepath || fileReference?.path === `"${filepath}"`) {
      return {
        basename: fileReferences[`${key}_comment`] ?? fileReference.name ?? filepath.split('/').pop(),
        fileRef: key,
      };
    }
  }

  return null;
}

function ensureFileInGroup(project, groupKey, fileReference) {
  const group = project.getPBXGroupByKey(groupKey);
  if (!group) {
    return;
  }

  if (group.children.some((child) => child.value === fileReference.fileRef)) {
    return;
  }

  project.addToPbxGroup(fileReference, groupKey);
}

function ensureSharedFileReference(project, { filepath, groupKey }) {
  const existingFileReference = findFileReference(project, filepath);
  if (existingFileReference) {
    ensureFileInGroup(project, groupKey, existingFileReference);
    return existingFileReference;
  }

  const file = new pbxFile(filepath);
  file.fileRef = project.generateUuid();
  project.addToPbxFileReferenceSection(file);
  project.addToPbxGroup(file, groupKey);

  return {
    basename: file.basename,
    fileRef: file.fileRef,
  };
}

function phaseHasFileReference(project, phase, fileRef) {
  const buildFiles = project.hash.project.objects.PBXBuildFile ?? {};

  return (phase.files ?? []).some((entry) => {
    const buildFile = buildFiles[entry.value];
    return buildFile?.fileRef === fileRef;
  });
}

function addFileReferenceToTarget(project, { fileReference, targetUuid, phaseType, phaseLabel }) {
  ensureBuildPhase(project, targetUuid, phaseType, phaseLabel);
  const phase = findBuildPhase(project, targetUuid, phaseType);

  if (!phase || phaseHasFileReference(project, phase, fileReference.fileRef)) {
    return;
  }

  const buildFileUuid = project.generateUuid();
  const comment = `${fileReference.basename} in ${phaseLabel}`;
  const buildFiles = project.hash.project.objects.PBXBuildFile;

  buildFiles[buildFileUuid] = {
    isa: 'PBXBuildFile',
    fileRef: fileReference.fileRef,
  };
  buildFiles[`${buildFileUuid}_comment`] = comment;

  phase.files.push({
    value: buildFileUuid,
    comment,
  });
}

const withShortcutCopyXcode = (config) =>
  withXcodeProject(config, (config) => {
    const project = config.modResults;
    const sharedGroupKey = ensureGroup(project, SHARED_NATIVE_GROUP_NAME);
    const copyHelperFile = ensureSharedFileReference(project, {
      filepath: COPY_HELPER_SOURCE_PATH,
      groupKey: sharedGroupKey,
    });
    const reasonCatalogFile = ensureSharedFileReference(project, {
      filepath: REASON_CATALOG_SOURCE_PATH,
      groupKey: sharedGroupKey,
    });
    const shortcutSwiftFile = ensureSharedFileReference(project, {
      filepath: COPY_SHORTCUT_SOURCE_PATH,
      groupKey: sharedGroupKey,
    });

    const mainAppTargetUuid = project.findTargetKey(MAIN_APP_TARGET_NAME);

    if (mainAppTargetUuid) {
      addFileReferenceToTarget(project, {
        fileReference: copyHelperFile,
        targetUuid: mainAppTargetUuid,
        phaseType: 'PBXSourcesBuildPhase',
        phaseLabel: 'Sources',
      });
      addFileReferenceToTarget(project, {
        fileReference: shortcutSwiftFile,
        targetUuid: mainAppTargetUuid,
        phaseType: 'PBXSourcesBuildPhase',
        phaseLabel: 'Sources',
      });
      addFileReferenceToTarget(project, {
        fileReference: reasonCatalogFile,
        targetUuid: mainAppTargetUuid,
        phaseType: 'PBXResourcesBuildPhase',
        phaseLabel: 'Resources',
      });
    }

    ensureTargetDeploymentTarget(project, SHORTCUTS_TARGET_NAME, '18.0');

    return config;
  });

module.exports = createRunOncePlugin(withShortcutCopyXcode, PLUGIN_NAME, '1.0.0');
