<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ButtonGroup from "./ButtonGroup.svelte";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Example/ButtonGroup",
    component: ButtonGroup,
    tags: ["autodocs"],
    argTypes: {},
    args: {},
    // @ts-expect-error This is apparently a bug https://github.com/storybookjs/storybook/issues/29951
    decorators: [() => BuilderStyleRoot],
  });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Primary">
  <button>One</button>
  <button>Two</button>
  <button>Three</button>
</Story>
