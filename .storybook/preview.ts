import { createElement } from "react";
import type { Preview } from "@storybook/react";
import "../packages/tokens/kit.css";

const preview: Preview = {
  parameters: { backgrounds: { disable: true }, layout: "centered" },
  globalTypes: { skin: { description: "Skin", defaultValue: "beacon",
    toolbar: { title: "Skin", icon: "paintbrush", items: ["beacon", "ember", "paper", "terminal", "swamp"], dynamicTitle: true } } },
  decorators: [(Story, ctx) => {
    const skin = ctx.parameters.skin ?? ctx.globals.skin ?? "beacon";
    document.body.dataset.skin = skin; // full-page background follows the skin
    return createElement("div", { "data-skin": skin, style: { padding: "1rem" } }, createElement(Story));
  }],
};
export default preview;
