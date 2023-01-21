import { DynamicModule } from '@nestjs/common';
import { Type } from '@nestjs/common/interfaces/type.interface';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { createHash } from 'crypto';

export class ModuleTokenFactory {
  private readonly moduleIdsCache = new WeakMap<Type<unknown>, string>();
  private readonly moduleTokenCache = new Map<string, string>();
  private readonly dynamicallyModuleMetadataCache = new WeakMap<
    Partial<DynamicModule>,
    string
  >();

  public create(
    metatype: Type<unknown>,
    dynamicModuleMetadata?: Partial<DynamicModule> | undefined,
  ): string {
    const moduleId = this.getModuleId(metatype);

    if (!dynamicModuleMetadata)
      return this.getFastModuleToken(moduleId, this.getModuleName(metatype));

    if (this.dynamicallyModuleMetadataCache.has(dynamicModuleMetadata))
      return this.dynamicallyModuleMetadataCache.get(dynamicModuleMetadata);

    this.dynamicallyModuleMetadataCache.set(
      dynamicModuleMetadata,
      randomStringGenerator(),
    );

    return this.dynamicallyModuleMetadataCache.get(dynamicModuleMetadata);
  }

  public getFastModuleToken(moduleId: string, moduleName: string): string {
    const key = `${moduleId}_${moduleName}`;

    if (this.moduleTokenCache.has(key)) return this.moduleTokenCache.get(key);

    const hash = createHash('sha1').update(key).digest('hex');

    this.moduleTokenCache.set(key, hash);

    return hash;
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
