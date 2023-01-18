import { expect } from 'chai';
import * as hash from 'object-hash';
import * as sinon from 'sinon';
import { ModuleTokenFactory } from '../../injector/module-token-factory';
import { InternalCoreModule } from '../../injector/internal-core-module';

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
      const hash1 = factory.create(type, undefined);
      const hash2 = factory.create(type, undefined);

      expect(hash1).to.be.deep.eq(hash2);

      expect(hash1).to.be.deep.eq(
        hash({
          id: moduleId,
          module: Module.name,
          dynamic: undefined,
        }),
      );
    });
    it('should include dynamic metadata', () => {
      const type = Module;
      const token = factory.create(type, {
        providers: [{}],
      } as any);

      expect(token).to.be.deep.eq(
        hash({
          id: moduleId,
          module: Module.name,
          dynamic: {
            providers: [{}],
          },
        }),
      );
    });
    it('should output random hash for InternalTokenModule', () => {
      const hash1 = factory.create(InternalCoreModule, undefined);
      const hash2 = factory.create(InternalCoreModule, undefined);

      expect(hash1).to.not.be.deep.eq(hash2);
    });
    describe('should output the same hash when', () => {
      it('has symbols', () => {
        const type = Module;

        const token = factory.create(type, {
          providers: [
            {
              provide: Symbol('a'),
              useValue: 'a',
            },
          ],
        } as any);

        expect(token).to.be.deep.eq(
          hash({
            id: moduleId,
            module: Module.name,
            dynamic: {
              providers: [
                {
                  provide: Symbol('a'),
                  useValue: 'a',
                },
              ],
            },
          }),
        );
      });
      it('has functions', () => {
        const type = Module;

        const token = factory.create(type, {
          providers: [
            {
              provide: 'potato',
              useFactory: () => 'test',
            },
            {
              provide: 'potato2',
              useFactory: async () => Promise.resolve('test'),
            },
          ],
        } as any);

        expect(token).to.be.deep.eq(
          hash({
            id: moduleId,
            module: Module.name,
            dynamic: {
              providers: [
                {
                  provide: 'potato',
                  useFactory: () => 'test',
                },
                {
                  provide: 'potato2',
                  useFactory: async () => Promise.resolve('test'),
                },
              ],
            },
          }),
        );
      });
      it('has classes', () => {
        class Module2 {}

        const type = Module;

        const token = factory.create(type, {
          providers: [
            {
              provide: 'potato',
              useClass: Module2,
            },
          ],
        } as any);

        expect(token).to.be.deep.eq(
          hash({
            id: moduleId,
            module: Module.name,
            dynamic: {
              providers: [
                {
                  provide: 'potato',
                  useClass: Module2,
                },
              ],
            },
          }),
        );
      });
      it('has circular references', () => {
        const type = Module;

        const obj: any = { test: true };

        obj.circular = obj;

        const obj2: any = { test: true };

        obj2.circular = obj2;

        const token = factory.create(type, {
          providers: [
            {
              provide: 'potato',
              useValue: obj,
            },
          ],
        } as any);

        expect(token).to.be.deep.eq(
          hash({
            id: moduleId,
            module: Module.name,
            dynamic: {
              providers: [
                {
                  provide: 'potato',
                  useValue: obj2,
                },
              ],
            },
          }),
        );
      });
    });
  });
  describe('getModuleName', () => {
    it('should map module metatype to name', () => {
      const metatype = () => {};
      expect(factory.getModuleName(metatype as any)).to.be.eql(metatype.name);
    });
  });
});
