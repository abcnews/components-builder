<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Modal from "./Modal.svelte";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";
  import { InfoCircle } from "svelte-bootstrap-icons";

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
  <div style="width:300px">Hello this is a modal</div>
{/snippet}
{#snippet footerChildren()}
  <button>Ok!</button>
{/snippet}
{#snippet titleIcon()}
  <InfoCircle />
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

<Story
  name="WithIcon"
  args={{
    children,
    footerChildren,
    titleIcon,
    title: "Modal with icon",
  }}
/>
