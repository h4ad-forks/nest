import { DynamicModule } from '@nestjs/common';
import { Type } from '@nestjs/common/interfaces/type.interface';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import * as hash from 'object-hash';
import { InternalCoreModule } from '@nestjs/core/injector/internal-core-module';

export class ModuleTokenFactory {
  private readonly moduleIdsCache = new WeakMap<Type<unknown>, string>();

  public create(
    metatype: Type<unknown>,
    dynamicModuleMetadata?: Partial<DynamicModule> | undefined,
  ): string {
    // we need to skip this module because it contains properties
    // that cannot be hashed by object-hash, also, this module
    // can be safely removed because it's only used internaly
    if (metatype === InternalCoreModule) {
      return randomStringGenerator();
    }

    const moduleId = this.getModuleId(metatype);
    const opaqueToken = {
      id: moduleId,
      module: this.getModuleName(metatype),
      dynamic: dynamicModuleMetadata,
    };
    return hash(opaqueToken, { ignoreUnknown: true });
  }

  public getModuleId(metatype: Type<unknown>): string {
    let moduleId = this.moduleIdsCache.get(metatype);
    if (moduleId) {
      return moduleId;
    }
    moduleId = randomStringGenerator();
    this.moduleIdsCache.set(metatype, moduleId);
    return moduleId;
  }

  public getModuleName(metatype: Type<any>): string {
    return metatype.name;
  }
}
