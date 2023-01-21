import { DynamicModule } from '@nestjs/common';
import { Type } from '@nestjs/common/interfaces/type.interface';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { isFunction, isSymbol } from '@nestjs/common/utils/shared.utils';
import { createHash } from 'crypto';
import stringify from 'fast-safe-stringify';
import * as hash from 'object-hash';

export class ModuleToken implements DynamicModule {
  constructor(props: DynamicModule) {
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

export class ModuleTokenFactory {
  private readonly moduleIdsCache = new WeakMap<Type<unknown>, string>();
  private readonly moduleTokensCache = new Map<string, string>();

  public create(
    metatype: Type<unknown>,
    dynamicModuleMetadata?: Partial<DynamicModule> | undefined,
  ): string {
    if (dynamicModuleMetadata instanceof ModuleToken)
      return dynamicModuleMetadata.moduleId;

    const moduleId = this.getModuleId(metatype);

    if (!dynamicModuleMetadata)
      return this.getFastModuleToken(moduleId, this.getModuleName(metatype));

    const opaqueToken = {
      id: moduleId,
      module: this.getModuleName(metatype),
      dynamic: this.getDynamicMetadataToken(dynamicModuleMetadata),
    };
    return hash(opaqueToken, { ignoreUnknown: true });
  }

  public getFastModuleToken(moduleId: string, moduleName: string): string {
    const key = `${moduleId}_${moduleName}`;

    if (this.moduleTokensCache.has(key)) return this.moduleTokensCache.get(key);

    const hash = createHash('sha1').update(key).digest('hex');

    this.moduleTokensCache.set(key, hash);

    return hash;
  }

  public getDynamicMetadataToken(
    dynamicModuleMetadata: Partial<DynamicModule> | undefined,
  ): string {
    // Uses safeStringify instead of JSON.stringify to support circular dynamic modules
    // The replacer function is also required in order to obtain real class names
    // instead of the unified "Function" key
    return dynamicModuleMetadata
      ? stringify(dynamicModuleMetadata, this.replacer)
      : '';
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

  private replacer(key: string, value: any) {
    if (isFunction(value)) {
      const funcAsString = value.toString();
      const isClass = /^class\s/.test(funcAsString);
      if (isClass) {
        return value.name;
      }
      return hash(funcAsString, { ignoreUnknown: true });
    }
    if (isSymbol(value)) {
      return value.toString();
    }
    return value;
  }
}
