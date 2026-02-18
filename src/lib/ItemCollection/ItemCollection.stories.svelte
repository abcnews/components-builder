<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ItemCollection from "./ItemCollection.svelte";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";
  import FormActions from "./FormActions.svelte";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Example/ItemCollection",
    component: ItemCollection,
    tags: ["autodocs"],
    argTypes: {},
    args: {
      legend: "A collection of editable and deletable items",
    },
    // @ts-expect-error This is apparently a bug https://github.com/storybookjs/storybook/issues/29951
    decorators: [() => BuilderStyleRoot],
  });
</script>

<script lang="ts">
  type Item = { name: string };
  let collection: (Item & DeletableType)[] = $state([
    { name: "Item 1" },
    { name: "Item 2" },
  ]);
  let current: (Item & DeletableType) | undefined = $state();
</script>

<p>Can I just put documentation here?</p>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Primary">
  {#snippet template(args)}
    <ItemCollection
      bind:current
      bind:collection
      template={{ name: "Item name" }}
      legend={args.legend || "Legend"}
      itemLabelGetter={(item) => item.name}
    >
      {#snippet EditForm()}
        {#if current}
          <label for="annotation-text">Name</label>
          <input id="annotation-text" type="text" bind:value={current.name} />
          <FormActions bind:item={current} />
        {/if}
      {/snippet}
    </ItemCollection>
  {/snippet}
</Story>
