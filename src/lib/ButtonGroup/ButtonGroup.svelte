<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<span class="button-group">
  {@render children()}
</span>

<style>
  .button-group {
    display: flex;
    flex-direction: row;
    white-space: collapse nowrap;

    :global(button) {
      display: block;
      margin-right: -1px;
      flex-grow: 1;
      :global(> *) {
        vertical-align: text-bottom;
      }
    }

    :global(button:hover, button:focus) {
      z-index: 2;
    }

    :global(button:not(:last-child)) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    :global(button:not(:first-child)) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
</style>
