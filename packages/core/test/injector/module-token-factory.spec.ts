import { expect } from 'chai';
import { createHash } from 'crypto';
import stringify from 'fast-safe-stringify';
import * as hash from 'object-hash';
import * as sinon from 'sinon';
import { ModuleTokenFactory } from '../../injector/module-token-factory';

describe('ModuleTokenFactory', () => {
  const moduleId = 'constId';
  let factory: ModuleTokenFactory;

  beforeEach(() => {
    factory = new ModuleTokenFactory();
    sinon.stub(factory, 'getModuleId').returns(moduleId);
  });
  describe('create', () => {
    class Module {}
    it('should return expected token', () => {
      const type = Module;
      const token = factory.create(type, undefined);
      expect(token).to.be.deep.eq(
        createHash('sha1').update(`${moduleId}_${Module.name}`).digest('hex'),
      );
    });
    it('should include dynamic metadata', () => {
      const type = Module;
      const sameObject = {
        providers: [{}],
      } as any;
      const token = factory.create(type, sameObject);
      const token2 = factory.create(type, sameObject);

      const token3 = factory.create(type, { providers: [{}] } as any);

      expect(token).to.be.deep.eq(token2);
      expect(token).to.be.deep.eq(token2);
      expect(token).not.to.be.deep.eq(token3);
    });
  });
  describe('getModuleName', () => {
    it('should map module metatype to name', () => {
      const metatype = () => {};
      expect(factory.getModuleName(metatype as any)).to.be.eql(metatype.name);
    });
  });
});
