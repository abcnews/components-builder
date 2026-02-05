<script lang="ts">
  import { untrack } from "svelte";

  let {
    values = [],
    value = [],
    disabled,
    onChange = () => {},
  }: {
    values: {
      value: string;
      label: string;
    }[];
    value: string[];
    disabled: boolean;
    onChange?: (val: string[]) => void;
  } = $props();

  const uniqueId = "list" + (Math.random() * 10e15).toString(16);
  let selectedValues = $state<string[]>(untrack(() => value));
  let isFocused = $state(false);
  let inputElement = $state<HTMLInputElement>();
  let inputValue = $state("");

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
      selectedValues = Array.from(
        new Set([...selectedValues, foundValue.value]),
      );
      inputValue = "";
      onChange(selectedValues);
    });
  });
  $effect(() => {
    selectedValues = value;
  });
  let displayValues = $derived.by(() => {
    return selectedValues.map(
      (value) =>
        values.find((thisValue) => thisValue.value === value)?.label || "",
    );
  });
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
  <ul class="typeahead__selected-items">
    {#each displayValues as label}
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <li class="typeahead__selected-item" onclick={(e) => e.stopPropagation()}>
        <div class="typeahead__selected-item-text">
          {label}
        </div>
        <button
          class="typeahead__selected-item-butt"
          aria-label={`Remove ${label}`}
          onclick={(e) => {
            e.preventDefault();
            const foundValue = getValueFromLabel(label);
            if (!foundValue) {
              return;
            }
            selectedValues = selectedValues.filter(
              (thisValue) => thisValue !== foundValue.value,
            );
            onChange(selectedValues);
          }}>x</button
        >
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
    max-height: 6rem;
    overflow: auto;
  }
  .typeahead__selected-item {
    background: var(--background);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 0.2rem;
    position: relative;
    padding: 0.25rem;
    padding-right: 1.75rem;
    display: inline-block;
    font-size: 0.75rem;
  }

  .typeahead__selected-item-text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .typeahead button.typeahead__selected-item-butt {
    position: absolute;
    right: 0;
    top: 0;
    padding: 0;
    height: 100%;
    width: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
  }
</style>
