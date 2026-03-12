<script lang="ts" generics="Item extends DeletableType, Template extends Item">
  import type { Snippet } from "svelte";
  import ItemList from "./ItemList.svelte";
  import { Plus } from "svelte-bootstrap-icons";

  interface Props {
    current: Item | undefined;
    template: Template;
    collection: Item[];
    legend: string;
    itemLabelGetter(item: Item): string;
    EditForm: Snippet<[Item]>;
  }

  let {
    legend,
    collection = $bindable(),
    current = $bindable(),
    template,
    itemLabelGetter,
    EditForm,
  }: Props = $props();

  const add = () => {
    current = structuredClone(template);
    collection.push(current);
  };
</script>

<fieldset>
  <legend>{legend}</legend>
  {#if current}
    {@render EditForm(current)}
  {:else}
    <button class="new-item" onclick={add}><Plus /> New</button>
    <ItemList
      bind:items={collection}
      edit={(item) => (current = item)}
      getLabel={itemLabelGetter}
    />
  {/if}
</fieldset>

<style>
  fieldset {
    position: relative;
  }
  .new-item {
    position: absolute;
    top: calc(-2em + 3px);
    right: 0.75rem;
    backdrop-filter: blur(50px);
  }

  button > :global(*) {
    vertical-align: text-bottom;
  }
</style>
