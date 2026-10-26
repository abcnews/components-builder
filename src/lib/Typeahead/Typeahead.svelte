<script lang="ts">
  import { untrack, type Snippet } from "svelte";

  let {
    values = [],
    value = $bindable([]),
    disabled,
    item,
    ...rest
  }: {
    values: {
      value: string;
      label: string;
    }[];
    /** Selected values, in order. Use `bind:value` */
    value: string[];
    disabled: boolean;
    /** Replaces the contents of each selected item. Defaults to the label and a remove button */
    item?: Snippet<
      [
        {
          value: string;
          label: string;
          index: number;
          /** Replaces this item's value, keeping its position */
          setValue: (newValue: string) => void;
          remove: () => void;
        },
      ]
    >;
  } = $props();

  // `onChange` was replaced by `bind:value`; fail loudly rather than silently never calling it
  if ("onChange" in rest) {
    throw new Error(
      "Typeahead no longer supports `onChange`. Use `bind:value` instead.",
    );
  }

  const uniqueId = "list" + (Math.random() * 10e15).toString(16);
  /** Marks drags that started from this list, so unrelated drops are ignored */
  const dragType = `application/x-${uniqueId}`;
  let isFocused = $state(false);
  let inputElement = $state<HTMLInputElement>();
  let listElement = $state<HTMLUListElement>();
  let inputValue = $state("");
  let dragIndex = $state<number>();
  let dropIndex = $state<number>();

  function getValueFromLabel(label: string) {
    const foundValue = values.find((value) => value.label === label);
    return foundValue;
  }
  $effect(() => {
    const foundValue = getValueFromLabel(inputValue);
    if (!foundValue) {
      return;
    }
    untrack(() => {
      value = Array.from(new Set([...value, foundValue.value]));
      inputValue = "";
    });
  });
  let displayItems = $derived(
    value.map((selectedValue) => ({
      value: selectedValue,
      label: values.find((v) => v.value === selectedValue)?.label ?? "",
    })),
  );

  function moveItem(from: number, to: number) {
    if (from === to || to < 0 || to >= value.length) {
      return;
    }
    const nextValues = [...value];
    nextValues.splice(to, 0, ...nextValues.splice(from, 1));
    value = nextValues;
  }
</script>

<!-- this interaction is supplementary to the input element, so it's not an accessibility issue -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="typeahead"
  class:typeahead--focused={isFocused}
  class:typeahead--disabled={disabled}
  onclick={(e) => inputElement?.focus()}
>
  <input
    class="typeahead__input"
    {disabled}
    bind:this={inputElement}
    bind:value={inputValue}
    list={uniqueId}
    onfocus={() => {
      isFocused = true;
    }}
    onblur={() => {
      isFocused = false;
    }}
  />
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <ul
    class="typeahead__selected-items"
    bind:this={listElement}
    ondragleave={(e) => {
      if (!listElement?.contains(e.relatedTarget as Node)) {
        dropIndex = undefined;
      }
    }}
  >
    {#each displayItems as displayItem, index}
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <li
        class="typeahead__selected-item"
        class:typeahead__selected-item--dragging={dragIndex === index}
        class:typeahead__selected-item--drop-before={dropIndex === index &&
          dragIndex !== undefined &&
          dragIndex > index}
        class:typeahead__selected-item--drop-after={dropIndex === index &&
          dragIndex !== undefined &&
          dragIndex < index}
        draggable="true"
        onclick={(e) => e.stopPropagation()}
        ondragstart={(e) => {
          dragIndex = index;
          e.dataTransfer?.setData(dragType, String(index));
        }}
        ondragover={(e) => {
          if (e.dataTransfer?.types.includes(dragType)) {
            e.preventDefault();
            dropIndex = index;
          }
        }}
        ondrop={(e) => {
          e.preventDefault();
          moveItem(Number(e.dataTransfer?.getData(dragType)), index);
        }}
        ondragend={() => {
          dragIndex = dropIndex = undefined;
        }}
      >
        <span class="typeahead__selected-item-handle" aria-hidden="true">⠿</span>
        {#if item}
          {@render item({
            ...displayItem,
            index,
            setValue: (newValue) =>
              (value = value.map((v, i) => (i === index ? newValue : v))),
            remove: () => (value = value.filter((_, i) => i !== index)),
          })}
        {:else}
          <div class="typeahead__selected-item-text">
            {displayItem.label}
          </div>
          <button
            class="typeahead__selected-item-butt"
            aria-label={`Remove ${displayItem.label}`}
            onclick={(e) => {
              e.preventDefault();
              value = value.filter((_, i) => i !== index);
            }}>x</button
          >
        {/if}
      </li>
    {/each}
  </ul>
</div>
<datalist id={uniqueId}>
  {#each values as value}
    <option value={value.label}></option>
  {/each}
</datalist>

<style>
  .typeahead {
    padding: 0.25rem 0.5rem;
    background: var(--background);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 0.2rem;
  }
  .typeahead--focused {
    outline: 2px solid Highlight;
  }
  .typeahead--disabled {
    background: transparent;
    cursor: not-allowed;
  }
  .typeahead--disabled * {
    pointer-events: none;
  }
  ul,
  li {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .typeahead input.typeahead__input {
    border: none;
    outline: none;
    width: 100%;
    padding: 0.25rem 0;
    background: transparent;
    color: var(--c-black);
  }

  .typeahead__selected-items {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    max-height: var(--typeahead-items-max-height, 6rem);
    overflow: auto;
  }
  .typeahead__selected-item {
    background: var(--background);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 0.2rem;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    /* Set to `1 1 100%` to give each item its own row */
    flex: var(--typeahead-item-flex, 0 1 auto);
    font-size: 0.75rem;
    cursor: grab;
  }
  .typeahead__selected-item--dragging {
    opacity: 0.4;
  }
  /* The line shows where the dragged item will land: above the target when dragging up, below when dragging down */
  .typeahead__selected-item--drop-before {
    box-shadow: 0 -3px 0 0 Highlight;
  }
  .typeahead__selected-item--drop-after {
    box-shadow: 0 3px 0 0 Highlight;
  }
  .typeahead__selected-item-handle {
    opacity: 0.5;
    line-height: 1;
  }

  .typeahead__selected-item-text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .typeahead button.typeahead__selected-item-butt {
    padding: 0;
    height: 100%;
    width: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
  }
</style>
