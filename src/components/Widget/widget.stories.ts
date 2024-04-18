import type { Meta, StoryObj } from "@storybook/react";

import Widget from "./Widget";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Widget",
  component: Widget,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    tokenList: {
      description: "Array of addressed organized by chain id.",
    },
  },
  args: {
    tokenList: {
      [137]: ["0x61299774020dA444Af134c82fa83E3810b309991"],
      [1]: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
    },
  },
} satisfies Meta<typeof Widget>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Main: Story = {};
