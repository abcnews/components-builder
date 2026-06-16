<script lang="ts">
  /**
   * Component that renders an old school tabbable interface.
   */
  import type { Snippet } from "svelte";

  /**
   * Represents a single tab item.
   */
  export interface TabItem {
    /** Unique identifier for the tab. */
    id: string;
    /** Human-readable label for the tab. */
    label: string;
    /** Optional content to render when the tab is active. */
    content?: Snippet;
  }

  /**
   * Props for the Tabs component.
   */
  export interface Props {
    /** Array of tab items. */
    items: TabItem[];
    /** Currently active tab ID. Bindable. */
    activeId?: string;
    /** Additional CSS classes for the container. */
    class?: string;
    /** Inline styles for the container. */
    style?: string;
    /** Spread remaining attributes to the container. */
    [key: string]: unknown;
  }

  let {
    items = [],
    activeId = $bindable(),
    class: className = "",
    style = "",
    ...rest
  }: Props = $props();

  // Set default active tab if none provided
  $effect(() => {
    if (!activeId && items.length > 0) {
      activeId = items[0].id;
    }
  });

  const activeItem = $derived.by(() => items.find((i) => i.id === activeId));
  const hasContent = $derived.by(() => items.some((i) => i.content));
</script>

<div class="components-builder-tabs {className}" {style} {...rest}>
  <div class="components-builder-tabs-list" role="tablist">
    {#each items as item (item.id)}
      <button
        type="button"
        role="tab"
        aria-selected={activeId === item.id}
        aria-controls={hasContent ? `${item.id}-panel` : undefined}
        id={`${item.id}-tab`}
        class="components-builder-tab"
        class:active={activeId === item.id}
        onclick={() => (activeId = item.id)}
      >
        {item.label}
      </button>
    {/each}
    <div class="components-builder-tabs-filler"></div>
  </div>

  {#if hasContent}
    <div
      class="components-builder-tabs-content"
      role="tabpanel"
      id={`${activeId}-panel`}
      aria-labelledby={`${activeId}-tab`}
    >
      {#if activeItem?.content}
        {@render activeItem.content()}
      {/if}
    </div>
  {:else}
    <div class="components-builder-tabs-border-line"></div>
  {/if}
</div>

<style>
  .components-builder-tabs {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .components-builder-tabs-list {
    display: flex;
    align-items: flex-end;
    padding: 0 0.5rem 0 0;
    gap: 0.125rem;
    position: relative;
    z-index: 2;
    min-height: 2.25rem;
  }

  @media (min-width: 768px) {
    .components-builder-tabs-list,
    .components-builder-tab {
      min-height: 2rem;
    }
  }

  .components-builder-tab {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 0.2rem 0.2rem 0 0;
    padding: 0 1rem;
    min-width: 5rem;
    min-height: 2.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-light);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    z-index: 2;
    margin-bottom: 0;
  }

  .components-builder-tab:hover:not(.active) {
    background: var(--background-alt);
    color: var(--text);
    border-color: var(--border);
  }

  .components-builder-tab.active {
    background: var(--background);
    color: var(--text);
    border-color: var(--border);
    z-index: 4;
    height: calc(100% + 1px);
  }

  /* Use a pseudo-element to mask the bottom border correctly */
  .components-builder-tab.active::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: var(--background);
    z-index: 5;
  }

  /* The filler provides the rest of the bottom border for the tab list */
  .components-builder-tabs-filler {
    flex: 1;
    border-bottom: 1px solid var(--border);
    height: 1px;
    align-self: flex-end;
    margin-left: -0.125rem;
  }

  .components-builder-tabs-content {
    border: 1px solid var(--border);
    border-radius: 0 0.2rem 0.2rem 0.2rem;
    padding: 1.5rem;
    background-color: var(--background);
    position: relative;
    z-index: 1;
    margin-top: -1px; /* Seamless integration with tabs */
  }

  .components-builder-tabs-border-line {
    border-bottom: 1px solid var(--border);
    width: 100%;
    margin-top: -1px;
  }
</style>
