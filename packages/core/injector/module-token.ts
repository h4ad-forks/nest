import { DynamicModule } from '../../common/interfaces/modules/dynamic-module.interface';
import { randomStringGenerator } from '../../common/utils/random-string-generator.util';

export class ModuleToken implements DynamicModule {
  private constructor(props: DynamicModule) {
    this.moduleId = randomStringGenerator();
    this.module = props.module;
    this.global = props.global;
    this.imports = props.imports;
    this.controllers = props.controllers;
    this.providers = props.providers;
    this.exports = props.exports;
  }

  moduleId: string;

  module: DynamicModule['module'];
  global?: DynamicModule['global'];
  imports?: DynamicModule['imports'];
  controllers?: DynamicModule['controllers'];
  providers?: DynamicModule['providers'];
  exports?: DynamicModule['exports'];
}
