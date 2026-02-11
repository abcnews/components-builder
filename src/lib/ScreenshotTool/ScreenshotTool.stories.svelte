<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ScreenshotTool from "./ScreenshotTool.svelte";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Example/ScreenshotTool",
    component: ScreenshotTool,
    tags: ["autodocs"],
    argTypes: {},
    args: {},
    // @ts-expect-error This is apparently a bug https://github.com/storybookjs/storybook/issues/29951
    decorators: [() => BuilderStyleRoot],
  });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Primary"
  args={{
    // Prefixes to look for in the pasted document
    prefixes: { Marker: "#mark" },
  }}
/>
