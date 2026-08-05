import { sharedMappings } from '../../shared/federation.shared';

export default {
  name: 'mfe-reporting',
  exposes: {
    './Routes': './src/app/app.routes.ts',
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shared: (libraryName: string, defaultConfig: any) => {
    if (libraryName in sharedMappings) {
      return sharedMappings[libraryName];
    }
    return defaultConfig;
  }
};
