import type { Decorator } from '@storybook/react-vite';
import { HduxProContext } from '../src/pro/ProContext';

// Preview-only fixtures using the existing license context. Never exported by the library.
export const licensed: Decorator = (Story) => (
  <HduxProContext.Provider value={{ status: 'valid', licenseKey: undefined }}>
    <Story />
  </HduxProContext.Provider>
);
export const unlicensed: Decorator = (Story) => (
  <HduxProContext.Provider value={{ status: 'no-key', licenseKey: undefined }}>
    <Story />
  </HduxProContext.Provider>
);
