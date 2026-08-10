export interface StyleRegistryItem {
  className: string;
  themeName: string;
  cssContent: string;
}

export interface RemoteStyleConfig {
  /** Name of the remote MFE container (e.g. 'mfe-dashboard', 'mfe-reporting') */
  mfeName: string;
  /** Exposed module entry point (e.g. './SharedStyle') */
  exposedModule?: string;
  /** Target class name or CSS scope class to load/apply (e.g. 'mfe-shared-card') */
  className?: string;
  /** File name of the SCSS/CSS stylesheet */
  fileName?: string;
  /** Type of style injection ('js-module' | 'scss' | 'css-variables') */
  styleType?: 'js-module' | 'scss' | 'css-variables';
}

export interface RemoteStyleOptions {
  remoteName: string;
  exportName?: string;
  scopeClass?: string;
  exposedModule?: string;
}
