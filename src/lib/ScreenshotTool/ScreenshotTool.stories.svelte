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

<Story
  name="Custom screenshots service"
  args={{
    prefixes: { Marker: "#mark" },
    getGeneratorRequest: (config) => {
      const { graphicLocation, width, height } = config;
      const endpoint = new URL("https://screenshotsRus.com");
      const args = {
        url: graphicLocation.toString(),
        width: `${width}`,
        height: `${height}`,
        delay: "1000",
      };

      return new Request(endpoint.toString(), {
        method: "POST",
        body: JSON.stringify(args),
        headers: {
          "X-API-Key": "<some api key>",
        },
      });
    },
  }}
/>
