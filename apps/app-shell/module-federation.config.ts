import { sharedMappings } from '../../shared/federation.shared';

const config = {
  name: 'app-shell',
  remotes: [
    'mfe-auth'
  ],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shared: (libraryName: string, defaultConfig: any) => {
    if (libraryName in sharedMappings) {
      return {
        ...sharedMappings[libraryName],
        eager: true
      };
    }
    return {
      ...defaultConfig,
      eager: true
    };
  }
};

export default config;
