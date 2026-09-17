<script lang="ts" generics="Item extends { deleted?: number }">
  import { untrack } from "svelte";
  import { flip } from "svelte/animate";
  import Pencil from "svelte-bootstrap-icons/lib/Pencil.svelte";
  import ButtonGroup from "../ButtonGroup/ButtonGroup.svelte";
  import {
    Trash,
    ArrowCounterclockwise,
    GripVertical,
  } from "svelte-bootstrap-icons";

  interface Props {
    items: Item[];
    edit(item: Item): void;
    getLabel?(item: Item, idx: number): string;
    deleteDelay?: number;
    reorderable?: boolean;
  }

  let {
    items = $bindable(),
    edit,
    deleteDelay = 5000,
    getLabel = (item, idx) => `Item ${idx}`,
    reorderable = false,
  }: Props = $props();

  let deleteItemInterval = $state<NodeJS.Timeout>();

  let draggedIdx = $state<number | null>(null);

  const REORDER_ANIM_MS = 150;
  let swapLocked = false;

  const moveItem = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    items = next;
  };

  const finishDrag = () => {
    draggedIdx = null;
    swapLocked = false;
  };

  const handleDragStart = (e: DragEvent, idx: number) => {
    if (!reorderable) return;
    draggedIdx = idx;
    e.dataTransfer?.setData("text/plain", String(idx));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: DragEvent, idx: number) => {
    if (!reorderable || draggedIdx === null) return;
    if (idx === draggedIdx || swapLocked) return;
    swapLocked = true;
    moveItem(draggedIdx, idx);
    draggedIdx = idx;
    setTimeout(() => {
      swapLocked = false;
    }, REORDER_ANIM_MS);
  };

  const handleDragOver = (e: DragEvent) => {
    if (!reorderable) return;
    // Required to allow dropping at all; the actual reorder happens on dragenter above.
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: DragEvent) => {
    if (!reorderable) return;
    e.preventDefault();
    finishDrag();
  };

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
    {#each items as item, idx (item)}
      <li
        class:dragging={reorderable && draggedIdx === idx}
        animate:flip={{ duration: REORDER_ANIM_MS }}
        ondragenter={(e) => handleDragEnter(e, idx)}
        ondragover={handleDragOver}
        ondrop={handleDrop}
      >
        <span
          role="button"
          tabindex="0"
          onkeyup={(e) => e.key === " " && edit(item)}
          onclick={() => edit(item)}
          >{#if reorderable}
            <span
              class="drag-handle"
              draggable="true"
              role="button"
              tabindex="0"
              aria-label={`Reorder ${getLabel(item, idx)}`}
              ondragstart={(e) => handleDragStart(e, idx)}
              ondragend={finishDrag}
            >
              <GripVertical height="16" width="16" />
            </span>
          {/if}{getLabel(item, idx)}</span
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

  li.dragging {
    font-weight: bold;
  }

  .drag-handle {
    cursor: grab;
    touch-action: none;
    padding: 0;
    vertical-align: middle;
  }

  .drag-handle:active {
    cursor: grabbing;
  }
</style>
