<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BuilderViewport from "./BuilderViewport.svelte";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";

  const { Story } = defineMeta({
    title: "Example/BuilderViewport",
    component: BuilderViewport,
    tags: ["autodocs"],
    argTypes: {},
    args: {},
    // @ts-expect-error This is apparently a bug https://github.com/storybookjs/storybook/issues/29951
    decorators: [() => BuilderStyleRoot],
  });
</script>

{#snippet Viz()}
  <div style="padding: 20px; background: #eee; color: #333; height: 100%; box-sizing: border-box;">
    Visualization Content Area
  </div>
{/snippet}

<Story
  name="Primary"
  args={{
    Viz,
  }}
/>
