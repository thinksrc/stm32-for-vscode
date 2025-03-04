import assert from 'assert';
import { before, test, suite } from 'mocha';
import { getDirCaseFree, sortFiles, getIncludes } from '../../src/ListFiles';


// TODO: perhaps also test the total ListFiles flow, however this means looking into mocking
const goodTestDir = ['Src', 'Inc', 'lib', 'Drivers', 'Middlewares'];
const fileList = [
  'Src/main.cpp',
  'Src/RandomDriver.cpp',
  'Src/stm32h7xx_it.c',
  'Src/stm32h7xx_hal_msp.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_cortex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_eth.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_eth_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_tim.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_tim_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_uart.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_uart_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pcd.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pcd_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_ll_usb.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_rcc.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_rcc_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_flash.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_flash_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_gpio.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_hsem.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_dma.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_dma_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_mdma.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pwr.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pwr_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_i2c.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_i2c_ex.c',
  'Src/system_stm32h7xx.c',
  'Src/stm32h7xx_it.h',
  'Src/stm32h7xx_hal_msp.h',
  'Inc/RandomDriver.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_cortex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_eth.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_eth_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_tim.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_tim_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_uart.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_uart_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_pcd.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_pcd_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_ll_usb.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_rcc.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_rcc_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_flash.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_flash_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_gpio.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_hsem.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_dma.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_dma_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_mdma.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_pwr.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_pwr_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_i2c.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_i2c_ex.h',
  'Inc/system_stm32h7xx.h',
  'startup_stm32h743xx.s',
];
const headerFiles = [
  'Inc/RandomDriver.h',
  'Src/stm32h7xx_it.h',
  'Src/stm32h7xx_hal_msp.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_cortex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_eth.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_eth_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_tim.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_tim_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_uart.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_uart_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_pcd.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_pcd_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_ll_usb.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_rcc.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_rcc_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_flash.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_flash_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_gpio.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_hsem.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_dma.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_dma_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_mdma.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_pwr.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_pwr_ex.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_i2c.h',
  'Drivers/STM32H7xx_HAL_Driver/Inc/stm32h7xx_hal_i2c_ex.h',
  'Inc/system_stm32h7xx.h',
];

const asmFiles = ['startup_stm32h743xx.s'];
const cFiles = [
  'Src/stm32h7xx_it.c',
  'Src/stm32h7xx_hal_msp.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_cortex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_eth.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_eth_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_tim.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_tim_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_uart.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_uart_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pcd.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pcd_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_ll_usb.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_rcc.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_rcc_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_flash.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_flash_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_gpio.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_hsem.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_dma.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_dma_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_mdma.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pwr.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_pwr_ex.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_i2c.c',
  'Drivers/STM32H7xx_HAL_Driver/Src/stm32h7xx_hal_i2c_ex.c',
  'Src/system_stm32h7xx.c',
];
const cxxFiles = [
  'Src/main.cpp',
  'Src/RandomDriver.cpp',
];
const cIncludes = [
  'Inc',
  'Src',
  'Drivers/STM32H7xx_HAL_Driver/Inc',
];

export const totalList = {
  cFiles: cFiles.sort(),
  headerFiles: headerFiles.sort(),
  cxxFiles: cxxFiles.sort(),
  asmFiles: asmFiles.sort(),
};
suite('ListFiles test', () => {
  // before(() => {
  //   vscode.window.showInformationMessage('Start all tests.');
  // });
  before(() => {
  });
  test('getDirCaseFree', () => {
    assert.equal(getDirCaseFree('noneExtistent', goodTestDir), null);
    assert.equal(getDirCaseFree('src', goodTestDir), 'Src');
    assert.equal(getDirCaseFree('Inc', goodTestDir), 'Inc');
    assert.equal(getDirCaseFree('Lib', goodTestDir), 'lib');
  });
  test('sortFiles', () => {
    assert.deepEqual(sortFiles({}, fileList), totalList);
  });
  test('getIncludes', () => {
    assert.deepEqual(getIncludes(headerFiles), cIncludes.sort());
  });
});
