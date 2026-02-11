<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ContextMenu from "./ContextMenu.svelte";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Example/ContextMenu",
    component: ContextMenu,
    tags: ["autodocs"],
    argTypes: {},
    args: {},
    // @ts-expect-error This is apparently a bug https://github.com/storybookjs/storybook/issues/29951
    decorators: [() => BuilderStyleRoot],
  });
</script>

{#snippet children()}
  <div class="section" style="white-space:pre-wrap;">
    <strong>Brisbane</strong>
    <small style="opacity:0.5">BNE</small>
  </div>
  <hr />
  <div class="section">Some notes about this seat</div>
  <hr />

  <label class="item">
    <div class="section">
      <input type="checkbox" /> An option
    </div>
  </label>

  <label class="item">
    <div class="section">
      <input type="checkbox" /> Another option
    </div>
  </label>

  <hr />

  <ul class="menu">
    <li><button class="item">Item 1</button></li>
    <li><button class="item">Item 2</button></li>
    <li><button class="item">Item 3</button></li>
  </ul>

  <hr />

  <ul class="menu menu--double">
    <li><button class="item">Item 1</button></li>
    <li><button class="item">Item 2</button></li>
    <li><button class="item">Item 3</button></li>
    <li><button class="item">Item 4</button></li>
    <li><button class="item">Item 5</button></li>
    <li><button class="item">Item 6</button></li>
  </ul>
{/snippet}

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Primary"
  args={{
    position: [0, 0],
    children: children,
    onClose: () => console.log("closed"),
  }}
/>
