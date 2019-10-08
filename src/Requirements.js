/**
 *
 * Functions to check and get the required tools.
 * Created by Jort Band - Bureau Moeilijke Dingen.
 */
import vscode, { window, workspace } from 'vscode';
import shelljs from 'shelljs';
import process from 'process';
import path from 'path';
import _ from 'lodash';


const { platform } = process;
const cortexDebugConfig = workspace.getConfiguration('cortex-debug');
const stm32Config = workspace.getConfiguration('stm32-for-vscode');
const tools = {};

export const stlinkDefinition = {
  name: 'stlink',
  standardCmd: 'stlink',
  otherCmds: ['st-util'],
  folder: false,
  missingMessage: 'STLink is missing, please include the path to the stlink executable e.g. usr/bin/st-util, install it, or add it to your PATH variable',
  download: {
    standard: 'https://github.com/texane/stlink',
    darwin: null,
    linux: null,
    windows: null,
  },
  brewCmd: 'brew install stlink',
  aptGetCmd: 'apt-get install stlink',
  winCmd: null,
  requiredByCortexDebug: true,
  configName: 'stlinkPath',
};

const makeDefinition = {
  name: 'make',
  standardCmd: 'make',
  otherCmds: ['gmake'],
  folder: false,
  missingMessage: 'Make is missing, please include the path to the make executable e.g. usr/bin/make, install it, or add it to your PATH variable',
  download: {
    standard: null,
    darwin: 'https://stackoverflow.com/questions/10265742/how-to-install-make-and-gcc-on-a-mac',
    linux: null,
    windows: 'https://sourceforge.net/projects/gnuwin32/files/make/3.81/make-3.81.exe/download?use_mirror=datapacket&download=',

  },
  brewCmd: 'brew install make',
  aptGetCmd: null,
  requiredByCortexDebug: false,
  configName: 'makePath',
};

const cmakeDefinition = {
  name: 'cmake',
  standardCmd: 'cmake',
  otherCmds: [],
  folder: false,
  missingMessage: 'cMake is missing, please include the path to the make executable e.g. usr/bin/cMake, install it, or add it to your PATH variable',
  download: {
    standard: 'https://cmake.org/download/',
  },
  brewCmd: 'brew install cmake',
  aptGetCmd: 'sudo apt-get install cmake',
  requiredByCortexDebug: false,
  configName: 'cmakePath',
};

export const armNoneEabiDefinition = {
  name: 'Arm toolchain',
  standardCmd: 'arm-none-eabi-g++',
  otherCmds: ['arm-none-eabi-g++', 'arm-none-eabi-gcc', 'arm-none-eabi-objcopy', 'arm-none-eabi-size'],
  folder: true,
  missingMessage: 'The GNU Arm Embedded toolchain is missing, please include the path to the arm-none-eabi-g++ executable e.g. usr/bin/local/arm-none-eabi/bin, install it, or add the arm-none-eabi tooling to your path variable',
  download: {
    standard: 'https://developer.arm.com/tools-and-software/open-source-software/developer-tools/gnu-toolchain/gnu-rm/downloads',
  },
  requiredByCortexDebug: true,
  configName: 'armToolchainPath',
};

/**
 * @description Checks if brew install or apt-get are available and returns
 * a string representation of this.
 */
function checkInstallMethods() {
  if (platform === 'darwin' && shelljs.which('brew')) {
    return 'Brew Install';
  }
  if (platform === 'linux' && shelljs.which('apt-get')) {
    return ('Apt Get');
  }
  return null;
}

/**
 * @description Checks for tooling at the specific toolpath and returns the path
 * to the command if available
 * @param {object} definition
 * @param {string?} cmdPath
 * @returns {string | boolean}
 */
export function checkToolPath(definition, cmdPath) {
  if (definition.folder) {
    // eslint-disable-next-line no-use-before-define
    return checkToolFolder(definition, cmdPath);
  }
  // first check the path
  if (cmdPath && cmdPath !== '' && shelljs.which(cmdPath)) {
    return cmdPath;
  }
  // after this check the path with the standard command
  if (_.isString(cmdPath)) {
    const standardPath = path.resolve(cmdPath, definition.standardCmd);
    if (shelljs.which(standardPath)) {
      return standardPath;
    }
    // after this check the path with the non standard commands
    let cPath = null;
    _.forEach(definition.otherCmds, (entry) => {
      const tryPath = path.resolve(cmdPath, entry);
      if (shelljs.which(tryPath)) {
        cPath = tryPath;
      }
    });
    if (cPath) {
      return cPath;
    }
  }


  // after this check just the standard command
  if (shelljs.which(definition.standardCmd)) {
    return definition.standardCmd;
  }
  // after this check the non standard commands
  let otherCmd = null;
  _.forEach(definition.otherCmds, (entry) => {
    if (shelljs.which(entry)) {
      otherCmd = entry;
    }
  });
  if (otherCmd) {
    return otherCmd;
  }
  // if none of the commands work return false
  return false;
}
/**
 * @description Checks if the commands are available in a folder and returns that folder.
 * @param {object} definition
 * @param {string} folderPath
 * @returns {string | boolean}
 */
function checkToolFolder(definition, folderPath) {
  if (!definition.folder) {
    return checkToolPath(definition, folderPath);
  }
  const trimmedFolderPath = _.trimEnd(folderPath, '/');
  if (!folderPath || folderPath === '' || folderPath === './' || trimmedFolderPath === '.') {
    let hasAll = true;
    _.forEach(definition.otherCmds, (entry) => {
      if (!shelljs.which(entry)) {
        hasAll = false;
      }
    });
    if (hasAll) {
      return trimmedFolderPath;
    }
  }

  // checks if all the commands are present in a specific folder.
  const standardGPPPath = path.resolve(folderPath, definition.standardCmd);
  if (shelljs.which(standardGPPPath)) {
    return trimmedFolderPath;
  }
  // else if not try to go a directory higher
  const dirUpPath = path.dirname(trimmedFolderPath);
  const dirUpCmd = path.resolve(dirUpPath, definition.standardCmd);
  if (shelljs.which(dirUpCmd)) {
    return dirUpPath;
  }
  if (shelljs.which(definition.standardCmd)) {
    return path.dirname(definition.standardCmd);
  }
  return false;
}

function checkSingleRequirement(definition) {
  const STMToolPath = _.get(stm32Config, definition.configName);
  const cortexDebugToolPath = _.get(cortexDebugConfig, definition.configName);
  const STMCheck = checkToolPath(definition, STMToolPath);

  let cortexDebugCheck;
  if (definition.requiredByCortexDebug) {
    cortexDebugCheck = checkToolPath(definition, cortexDebugToolPath);
  }
  if (_.isString(STMCheck) && STMCheck !== '') {
    // then it is valid

    if (STMToolPath !== STMCheck) {
      stm32Config.update(definition.configName, STMCheck);
    }
  } else if (_.isString(cortexDebugCheck)) {
    stm32Config.update(definition.configName, cortexDebugCheck);
  }

  if (_.isString(cortexDebugCheck)) {
    if (cortexDebugToolPath !== cortexDebugCheck) {
      cortexDebugConfig.update(definition.configName, cortexDebugCheck);
    }
  } else if (_.isString(STMCheck)) {
    cortexDebugConfig.update(definition.configName, STMCheck);
  }
  if (_.isString(STMCheck)) {
    return STMCheck;
  }
  if (_.isString(cortexDebugCheck)) {
    return cortexDebugCheck;
  }

  return false;
}

function browseAndAddToConfig(definition) {
  // TODO: adapt this to the new type of definition driven thing.

  window.showOpenDialog({ canSelectFolders: definition.folder, filters: {} }).then((uri) => {
    if (!uri || !uri[0]) return;
    const toolPathRes = checkToolPath(definition, uri[0].fsPath);
    if (_.isString(toolPathRes)) {
      stm32Config.update(definition.configName, toolPathRes);
      checkSingleRequirement(definition);
    } else {
      window.showErrorMessage('It seems that you did not select the required tool', 'Open again').then((selection) => {
        if (selection === 'Open again') {
          browseAndAddToConfig(definition);
        }
      });
    }
  });
}

/**
 * @description Shows a VSCode input box, in which the path to a tool can be entered.
 * If this path is correct,
 * it will be added to the configuration of STM32 for VScode and Cortex Debug.
 * @param {object} definition
 */
function inputToolPath(definition) {
  // TODO: add validateInput option, to check for appropriate paths
  const validation = (toolPath) => {
    const checkedPath = checkToolPath(definition, toolPath);
    if (!checkedPath) {
      return 'The current path does not point to the appropriate tool';
    }
    return null;
  };
  window.showInputBox({ placeHolder: `Path to: ${definition.name}`, validateInput: validation }).then((pathString) => {
    if (_.isString(checkToolPath(definition, pathString))) {
      stm32Config.update(definition.configName, pathString);
      checkSingleRequirement(definition);
    }
  });
}
function giveWarning(definition) {
  const installMethod = checkInstallMethods();
  let installable = false;
  if (_.isString(installMethod)) {
    if (platform === 'linux' && definition.aptGetCmd) {
      installable = true;
    }
    if (platform === 'darwin' && definition.brewCmd) {
      installable = true;
    }
  }
  vscode.window.showWarningMessage(
    definition.warningMessage,
    'Get',
    'Browse',
    'Input Path',
    installable ? installMethod : null,
  ).then((selection) => {
    switch (selection) {
      case 'Get':
        if (_.get(definition.download, platform)) {
          vscode.env.openExternal(_.get(definition.download, platform));
        } else if (definition.download.standard) {
          vscode.env.openExternal(definition.download.standard);
        }
        break;
      case 'Browse':
        browseAndAddToConfig(definition);
        break;
      case 'Input Path':
        inputToolPath(definition);
        break;
      case 'Brew Install':
        {
          const terminal = vscode.window.createTerminal();
          terminal.sendText(definition.brewCmd);
          terminal.show();
        }
        break;
      case 'Apt Get':
        {
          const terminal = vscode.window.createTerminal();
          terminal.sendText(definition.aptGetCmd);
          terminal.show();
        }
        break;
      default:
    }
  });
}

export default function checkRequirements() {
  // checks each requirement in order
  const hasSTLink = checkSingleRequirement(stlinkDefinition);
  const hasMake = checkSingleRequirement(makeDefinition);
  const hasCmake = checkSingleRequirement(cmakeDefinition);
  const hasArmToolchain = checkSingleRequirement(armNoneEabiDefinition);

  // if no path is present. We should give a warning.
  if (!_.isString(hasSTLink)) {
    giveWarning(stlinkDefinition);
  }
  if (!_.isString(hasMake)) {
    giveWarning(makeDefinition);
  }
  if (!_.isString(hasCmake) && stm32Config.enableTesting) {
    giveWarning(cmakeDefinition);
  }
  if (!_.isString(hasArmToolchain)) {
    giveWarning(hasArmToolchain);
  }
  return ({
    stlink: hasSTLink,
    make: hasMake,
    cMake: hasCmake,
    armToolchain: hasArmToolchain,
  });
}

export function getTools() {
  return tools;
}
