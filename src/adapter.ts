import type { Logger } from '#core/logger';
import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { isAbsolute } from 'node:path';
import semver from 'semver';
import { InvalidFilePath } from './errors/invalid-file-path.js';
import { InvalidModuleDependencies } from './errors/invalid-module-dependencies.js';
import { InvalidModuleManifest } from './errors/invalid-module-manifest.js';
import { InvalidModuleName } from './errors/invalid-module-name.js';
import { InvalidSemver } from './errors/invalid-semver.js';

export const MODULE_NAME = /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/;

export type Dependencies = Static<typeof Dependencies>;
export const Dependencies = Type.Record(
  Type.String({
    pattern: MODULE_NAME.source
  }),
  Type.String()
);

export type ModuleManifest = Static<typeof ModuleManifest>;
export const ModuleManifest = Type.Object({
  name: Type.String({
    pattern: MODULE_NAME.source
  }),
  description: Type.String(),
  version: Type.String(),
  enabled: Type.Optional(Type.Boolean()),
  main: Type.Optional(Type.String()),
  dependencies: Type.Optional(Dependencies)
});

export interface PublishingFile {
  content: Uint8Array;
  path: string;
  executable?: boolean;
}

export interface PublishInput {
  archive: Uint8Array;
  manifest: ModuleManifest;
  files: PublishingFile[];
}

export interface PublishResult {
  name: string;
  description: string;
  version: string;
  repositoryUrl?: string;
  archiveUrl?: string;
}

export interface SearchInput {
  query: string;
  take: number;
  skip: number;
}

export interface FoundModule {
  name: string;
  description: string;
  version: string;
  repositoryUrl?: string;
}

export interface SearchResult {
  objects: FoundModule[];
  total: number;
}

export interface ModuleVersion {
  manifest: ModuleManifest;
  repositoryUrl?: string;
  archiveUrl?: string;
}

export interface MetadataRepositoryAdapter {
  publish(input: PublishInput): Promise<PublishResult>;
  search(input: SearchInput): Promise<SearchResult>;
  listVersions(name: string): Promise<string[]>;
  getVersion(name: string, version: string): Promise<ModuleVersion>;
  downloadArchive(name: string, version: string): Promise<ReadableStream>;
}

interface MetadataRepositoryAdapterOptions {
  logger: Logger;
}

export interface MetadataRepositoryAdapterProvider {
  create(
    options: MetadataRepositoryAdapterOptions
  ): Promise<MetadataRepositoryAdapter>;
}

export function registerMetadataRepositoryAdapter(
  provider: MetadataRepositoryAdapterProvider
) {
  return provider;
}

export function assertModuleName(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !MODULE_NAME.test(value)) {
    throw new InvalidModuleName(
      `"${value}" is not a valid module name. Module names must match the pattern ${MODULE_NAME.source}.`
    );
  }
}

export function assertModuleManifest(
  value: unknown
): asserts value is ModuleManifest {
  if (!Value.Check(ModuleManifest, value)) {
    const detail = createValidationDetail(ModuleManifest, value);

    throw new InvalidModuleManifest(detail);
  }

  if (!isSemver(value.version)) {
    throw new InvalidModuleManifest('Version must be a valid semver string.');
  }

  if (value.dependencies !== undefined) {
    assertModuleDependencies(value.dependencies);
  }
}

function assertModuleDependencies(
  value: unknown
): asserts value is Record<string, string> {
  if (!Value.Check(Dependencies, value)) {
    throw new InvalidModuleDependencies(
      createValidationDetail(Dependencies, value)
    );
  }

  for (const [name, spec] of Object.entries(value)) {
    if (!isSupportedVersionSpec(spec)) {
      throw new InvalidModuleDependencies(
        `Dependency "${name}" has an invalid version specifier "${spec}".`
      );
    }
  }
}

export function assertSafeRelativePath(path: string) {
  if (!path || isAbsolute(path)) {
    throw new InvalidFilePath(`${path}: path must be relative.`);
  }

  const segments = path.split(/[\\/]/);
  if (segments.some((segment) => !segment || segment === '..')) {
    throw new InvalidFilePath(`${path}: invalid path.`);
  }
}

export function isSemver(value: string) {
  return semver.valid(value) === value;
}

export function sortSemverDescending(versions: string[]) {
  return semver.rsort(versions.filter(isSemver));
}

export function resolveVersionSpec(versions: string[], spec?: string) {
  const sorted = sortSemverDescending(versions);
  if (!spec) {
    return sorted[0];
  }

  if (isSemver(spec)) {
    return sorted.includes(spec) ? spec : undefined;
  }

  if (!isSupportedVersionSpec(spec)) {
    throw new InvalidSemver();
  }

  return semver.maxSatisfying(sorted, spec) ?? undefined;
}

function isSupportedVersionSpec(spec: string) {
  return isSemver(spec) || semver.validRange(spec) !== null;
}

function createValidationDetail(...args: Parameters<typeof Value.Errors>) {
  const error = Value.Errors(...args).First();

  return error ? `${error.path || '/'}: ${error.message}` : 'validation failed';
}
