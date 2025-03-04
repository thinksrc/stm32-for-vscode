/*
 * MakefileInfo.js
 * Set of functions for to extract information out of a makefile
 * Information to get:
 *   TARGET
 *   CPU
 *   FPU
 *   FLOAT-ABI
 *   C_SOURCES
 *   ASM_SOURCES
 *   C_DEFS
 *   AS_INCLUDES
 *   C_INCLUDES
 *   LDSCRIPT
 * Created by Jort Band- Bureau Moeilijke Dingen
 */
/* eslint no-param-reassign: ["error", {
  "props": true, "ignorePropertyModificationsFor": ["infoDef"] }] */
const _ = require('lodash');
const fs = require('fs');
const { window } = require('vscode');

export const makefileInfo = {
  target: '',
  cpu: '',
  targetMCU: '',
  fpu: '',
  floatAbi: '',
  mcu: '',
  ldscript: '',
  cSources: [],
  cxxSources: [],
  asmSources: [],
  cDefs: [],
  cxxDefs: [],
  asDefs: [],
  cIncludes: [],
  cxxIncludes: [],
  asIncludes: [],
}; // TODO: move this to getMakefileInfo() or extractMakefileInfo().
/**
 * @description
 * @param {string} location - location of the makefile e.g. /filepath/Makefile
 */
export async function getMakefile(location) {
  return new Promise((resolve, reject) => {
    fs.readFile(location, { encoding: 'utf8' }, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}
/**
 * @description Extracts single line info from a makefile
 * @param {string} name - The name of the Makefile parameter to extract e.g. FLOAT-ABI
 * @param {string} makefile - A string representation of the Makefile
 */
export function extractSingleLineInfo(name, makefile) {
  const newPatt = new RegExp(`${name}\\s=\\s(.*)`, 'gmi');
  const newRes = newPatt.exec(makefile);

  return _.last(newRes);
}
/**
 * @description Extracts multiline info from a makefile
 * @param {string} name - The name of the Makefile parameter to extract e.g. C_SOURCES
 * @param {string} makefile - A string representation of the Makefile
 */
export function extractMultiLineInfo(name, makefile) {
  const splitData = makefile.split(/\r\n|\r|\n/);
  const startPattern = new RegExp(`${name}\\s=\\s`, 'gmi');
  // const endPattern = new RegExp('^-?[a-z].*\\$', 'gim');
  const endPattern = /^-?[a-z].*\b$/gim;
  const emptyPattern = /^(\s*)$/gim;
  let end = 0;
  let start = 0;
  const cleanStrings = [];

  _.map(splitData, (line, ind) => {
    if (start && !end) {
      if (emptyPattern.test(line)) {
        end = ind;
        return;
      }
      cleanStrings.push(line.replace(/(\s\\$)|(\s.$)/gim, ''));
      if (endPattern.test(line)) {
        end = ind;
      }
    }
    if (startPattern.test(line)) {
      start = ind;
    }
  });

  return cleanStrings;
}

/**
 * @description Function for getting the target from the hal_msp.c file
 * e.g getting the target stm32l4x from: Src/stm32l4xx_hal_msp.c
 * @param {string[]} cFiles
 */
export function getTargetSTM(cFiles) {
  const regPattern = /(.*\/)?(.*)x_hal_msp.c/i;
  let output = '';
  _.map(cFiles, (fileName) => {
    if (regPattern.test(fileName)) {
      const regOut = regPattern.exec(fileName);
      output = _.last(regOut);
    }
  });
  return output;
}

/**
 * @description loops through an object file and tries to find the relevant documents
 * in the provided makefile
 * @param {object} infoDef - An object containing camelCased key of what should
 * be extracted from the makefile
 * @param {string} makefile - A string representation of the Makefile
 */
export function extractMakefileInfo(infoDef, makefile) {
  _.forEach(infoDef, (entry, key) => {
    // converts the make file key from camelCase to makefile casing. e.g. from cSources to c_sources
    let makeFileKey = _.replace(_.kebabCase(key), '-', '_');

    // Guard float-abi is the only key that does not hold the naming convention.
    if (makeFileKey === 'float_abi') {
      makeFileKey = 'float-abi';
    }
    const info = extractSingleLineInfo(makeFileKey, makefile);
    if (!info || info.length === 0) return;
    if (info.indexOf('\\') !== -1) {
      infoDef[key] = extractMultiLineInfo(makeFileKey, makefile);
    } else {
      infoDef[key] = info;
    }
  });
  if (_.isString(infoDef.targetMCU)) {
    // seperately get the tartgetMCU
    infoDef.targetMCU = getTargetSTM(infoDef.cSources);
  }

  return infoDef;
}

/**
 * @description async function for retrieving information from a makefile in JSON format.
 * @param {string} location - location of the makefile
 */
export default async function getMakefileInfo(location) {
  // TODO: no test to catch paramters of location
  return new Promise(async (resolve, reject) => {
    let loc = './Makefile';
    if (location && _.isString(location)) {
      loc = location;
    }
    // Guard for checking if the makefile name is actually appended to the location
    if (loc.lastIndexOf('Makefile') === -1) {
      if (loc.charAt(loc.length - 1) !== '/') {
        loc = loc.concat('/');
      }
      loc = loc.concat('Makefile');
    }
    // try getting the makefile
    let makefile = null;
    try {
      makefile = await getMakefile(loc);
    } catch (err) {
      window.showErrorMessage('Something went wrong with getting the information from the makefile. Please make sure there is a makefile and that the project is initialized through STM32CubeMX.', err);
      reject(err);
      return;
    }
    // when the makefile is found, extract the information according to the makefileInfo fields
    resolve(extractMakefileInfo(makefileInfo, makefile));
  });
}

// module.exports = {
//   getMakefileInfo,
//   makefileInfo,
// };
