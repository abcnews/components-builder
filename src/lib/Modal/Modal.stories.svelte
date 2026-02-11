<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Modal from "./Modal.svelte";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Example/Modal",
    component: Modal,
    tags: ["autodocs"],
    argTypes: {},
    args: {},
    // @ts-expect-error This is apparently a bug https://github.com/storybookjs/storybook/issues/29951
    decorators: [() => BuilderStyleRoot],
  });
</script>

{#snippet children()}
  Hello this is a modal
{/snippet}
{#snippet footerChildren()}
  <button>Ok!</button>
{/snippet}

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Primary"
  args={{
    children,
    footerChildren,
    title: "Example modal",
  }}
/>
