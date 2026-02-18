<script lang="ts" generics="Item extends { deleted?: number }">
  import { untrack } from "svelte";
  import Pencil from "svelte-bootstrap-icons/lib/Pencil.svelte";
  import ButtonGroup from "../ButtonGroup/ButtonGroup.svelte";
  import { Trash, ArrowCounterclockwise } from "svelte-bootstrap-icons";

  interface Props {
    items: Item[];
    edit(item: Item): void;
    getLabel?(item: Item, idx: number): string;
    deleteDelay?: number;
  }

  let {
    items = $bindable(),
    edit,
    deleteDelay = 5000,
    getLabel = (item, idx) => `Item ${idx}`,
  }: Props = $props();

  let deleteItemInterval = $state<NodeJS.Timeout>();

  $effect(() => {
    const shouldKeep = (item: Item) =>
      typeof item.deleted === "undefined" ||
      item.deleted > Date.now() - deleteDelay;
    deleteItemInterval = setInterval(() => {
      const _items = untrack(() => items);
      if (!_items.every(shouldKeep)) {
        items = _items.filter(shouldKeep);
      }
    }, 1000);

    return () => {
      clearTimeout(deleteItemInterval);
    };
  });
</script>

{#if items.length > 0}
  <ol>
    {#each items as item, idx}
      <li>
        <span
          role="button"
          tabindex="0"
          onkeyup={(e) => e.key === " " && edit(item)}
          onclick={() => edit(item)}>{getLabel(item, idx)}</span
        >
        <ButtonGroup>
          <button onclick={() => edit(item)}
            ><Pencil height="16" width="16" /></button
          >
          <button
            onclick={(e) => {
              e.preventDefault();
              if (item.deleted) {
                delete item.deleted;
              } else {
                item.deleted = Date.now();
              }
            }}
            title={item.deleted ? "Undo delete" : "Delete marker"}
          >
            {#if item.deleted}
              <ArrowCounterclockwise />
            {:else}
              <Trash />
            {/if}
          </button>
        </ButtonGroup>
      </li>
    {/each}
  </ol>
{/if}

<style>
  ol {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  li {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 2px;

    padding-bottom: 0.2em;
    &:not(:last-child) {
      margin-bottom: 0.2em;
    }

    button {
      height: 32px;
    }
  }
</style>
