<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BuilderFrame from "./BuilderFrame.svelte";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Example/BuilderFrame",
    component: BuilderFrame,
    tags: ["autodocs"],
    argTypes: {},
    args: {},
    // @ts-expect-error This is apparently a bug https://github.com/storybookjs/storybook/issues/29951
    decorators: [() => BuilderStyleRoot],
  });
</script>

{#snippet Sidebar()}
  Sidebar
{/snippet}

{#snippet Viz()}
  Viz
{/snippet}

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Primary"
  args={{
    Sidebar,
    Viz,
  }}
/>
