import type { StorybookConfig } from "@storybook/react-vite";
const config: StorybookConfig = {
  stories: ["../packages/*/src/**/*.stories.tsx"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  viteFinal: async (c) => {
    const { default: tailwindcss } = await import("@tailwindcss/vite"); // ESM-only
    return { ...c, plugins: [...(c.plugins ?? []), tailwindcss()] };
  },
};
export default config;
