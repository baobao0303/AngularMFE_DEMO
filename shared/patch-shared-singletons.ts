// Packages that MUST be shared as singleton across Shell + all remotes
export const SINGLETON_PACKAGES = [
  '@angular/core',
  '@angular/common',
  '@angular/common/http',
  '@angular/router',
  '@angular/forms',
  '@angular/animations',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular/compiler',
  'rxjs',
  'rxjs/operators',
];

/**
 * Patch the ModuleFederationPlugin shared config after Nx creates it.
 * Nx's project graph may not detect all Angular packages as dependencies,
 * so applySharedFunction never processes them. This directly mutates the
 * plugin options to ensure singleton sharing.
 *
 * @param config - The webpack config object returned by withModuleFederation
 * @param isHost - true for Shell (sets eager:true), false for remotes
 */
export function patchSharedSingletons(config: any, isHost: boolean): void {
  if (!config.plugins) return;

  for (const plugin of config.plugins) {
    const opts = plugin._options || plugin.options;
    if (opts && opts.name && opts.shared) {
      for (const pkg of SINGLETON_PACKAGES) {
        if (!opts.shared[pkg]) {
          opts.shared[pkg] = {
            singleton: true,
            strictVersion: true,
            eager: isHost,
            requiredVersion: false
          };
        } else {
          opts.shared[pkg].singleton = true;
          opts.shared[pkg].strictVersion = true;
          if (isHost) {
            opts.shared[pkg].eager = true;
          }
        }
      }
      break;
    }
  }
}
