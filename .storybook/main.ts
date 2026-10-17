import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/react-vite",
  viteFinal: async (config, { configType }) => {
    // GitHub Pages serves this repo at /hdux/ — set Vite base to match,
    // but only for production builds so local dev keeps the default base
    if (configType === 'PRODUCTION') {
      config.base = '/hdux/';
    }
    return config;
  },
};
export default config;
