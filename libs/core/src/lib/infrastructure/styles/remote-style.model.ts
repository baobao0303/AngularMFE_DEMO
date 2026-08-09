/**
 * Interface defining options required to dynamically load a Remote MFE Style.
 * Supports cross-repository dynamic loading via explicit remoteUrl.
 */
export interface RemoteStyleOptions {
  remoteName: string;
  exportName?: string;
  scopeClass?: string;
  exposedModule?: string;
  remoteUrl?: string; // 👈 CDN / Remote Entry URL for remotes in separate repositories
}

/**
 * Contract defining metadata of a Remote Style Module.
 */
export class RemoteStyleContract implements RemoteStyleOptions {
  constructor(
    public readonly remoteName: string,
    public readonly exportName?: string,
    public readonly scopeClass?: string,
    public readonly exposedModule?: string,
    public readonly remoteUrl?: string
  ) {}
}
