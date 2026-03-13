import type { Preview } from '@storybook/react-vite'

// Remove default white background so HDUX themes fill the viewport
const style = document.createElement('style');
style.textContent = `
  html, body, #storybook-root {
    margin: 0;
    padding: 0;
    height: 100%;
    min-height: 100vh;
    background: transparent !important;
  }
  #storybook-root > * {
    min-height: 100vh;
  }
`;
document.head.appendChild(style);

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;