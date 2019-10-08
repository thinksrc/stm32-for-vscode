// @ts-nocheck
import assert from 'assert';
import { before, test, suite } from 'mocha';
import sinon from 'sinon';
import shelljs from 'shelljs';
import path from 'path';
import {
  checkToolPath, stlinkDefinition, armNoneEabiDefinition,
} from '../../src/Requirements';


const shellJSStub = sinon.stub(shelljs, 'which').returns(false);
// const vscodeConfigStub = sinon.stub(vscode, 'workspace.getConfiguration').returns({set: (this)});

suite('Requirements test', () => {
  before(() => {

  });
  test('checkToolPath does not have tool test', () => {
    shellJSStub.returns(false);
    assert.equal(checkToolPath(stlinkDefinition, '.'), false);
    assert.equal(checkToolPath(stlinkDefinition, '/fakepath'), false);
  });

  test('checkToolPath does have tool', () => {
    // assert.equal(checkToolPath(fakeCMDDefinition, '.'), false);
    shellJSStub.returns(true);
    assert.equal(checkToolPath(stlinkDefinition, '/usr/bin/st-util'), '/usr/bin/st-util');
    shellJSStub.returns(false);
    shellJSStub.withArgs('/usr/bin/st-util').returns(true);
    assert.equal(checkToolPath(stlinkDefinition, '/usr/bin/'), '/usr/bin/st-util');
    shellJSStub.withArgs('/usr/bin/st-util').returns(false); // reset
    shellJSStub.withArgs('/usr/bin/st-util').returns(true);
    assert.equal(checkToolPath(stlinkDefinition, '/usr/bin'), '/usr/bin/st-util');
    assert.equal(checkToolPath(stlinkDefinition, 'usr/'), false);
    assert.equal(checkToolPath(stlinkDefinition, '/usr/bin/st-util'), '/usr/bin/st-util');
    shellJSStub.withArgs('/usr/bin/st-util').returns(false); // reset
  });
  test('checkToolPath does not have folder', () => {
    shellJSStub.returns(false);
    assert.equal(checkToolPath(armNoneEabiDefinition, '.'), false);
    assert.equal(checkToolPath(armNoneEabiDefinition, './arm-none-eabi-g++'), false);
  });

  test('checkToolPath does have folder', () => {
    shellJSStub.returns(true);
    assert.equal(checkToolPath(armNoneEabiDefinition, './'), '.');
    assert.equal(checkToolPath(armNoneEabiDefinition, './bin'), './bin');
    assert.equal(checkToolPath(armNoneEabiDefinition, 'usr/more/slashes/to.test/'), 'usr/more/slashes/to.test');
    shellJSStub.returns(false);
    const armNoneEabiPath = path.resolve('usr/bin/arm-none-eabi/arm-none-eabi-g++');
    shellJSStub.withArgs(armNoneEabiPath).returns(true);
    assert.equal(checkToolPath(armNoneEabiDefinition, './'), false);
    assert.equal(checkToolPath(armNoneEabiDefinition, './bin'), false);
    assert.equal(checkToolPath(armNoneEabiDefinition, 'usr/more/slashes/to.test/'), false);

    assert.equal(checkToolPath(armNoneEabiDefinition, 'usr/bin/arm-none-eabi'), 'usr/bin/arm-none-eabi');
    assert.equal(checkToolPath(armNoneEabiDefinition, 'usr/bin/arm-none-eabi/'), 'usr/bin/arm-none-eabi');
    assert.equal(checkToolPath(armNoneEabiDefinition, 'usr/bin/arm-none-eabi/arm-none-eabi-g++'), 'usr/bin/arm-none-eabi');
    shellJSStub.withArgs(armNoneEabiPath).returns(false);
  });
  test('checkToolPath has standard cmd', () => {
  });
  // test('checkToolPath does have tool', () => {
  //   assert.equal(getDirCaseFree('noneExtistent', goodTestDir), null);
  // });
  // test('checkToolPath has folder tool test', () => {
  //   assert.equal(getDirCaseFree('noneExtistent', goodTestDir), null);
  // });
});
