<script lang="ts">
  import BuilderViewport from "../BuilderViewport/BuilderViewport.svelte";

  interface Props {
    /** Svelte snippet to render the visualization content. */
    Viz?: import("svelte").Snippet;
    /** Svelte snippet to render the sidebar content. */
    Sidebar?: import("svelte").Snippet;
    /** Whether to enable the viewport resizing and controls. Defaults to true. */
    enableViewport?: boolean;
  }

  let { Viz, Sidebar, enableViewport = true }: Props = $props();
</script>

<div class="builder-frame">
  <div class="builder-frame__viz">
    {#if enableViewport}
      <BuilderViewport {Viz} />
    {:else}
      {@render Viz?.()}
    {/if}
  </div>

  <div class="builder-frame__sidebar">{@render Sidebar?.()}</div>
</div>

<style>
  .builder-frame {
    display: flex;
    height: 100vh;
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: var(--background);
    color: var(--text);
  }
  .builder-frame__viz {
    flex: 1;
    min-width: 50%;
    position: relative;
    overflow: hidden;
  }

  .builder-frame__sidebar {
    width: 22rem;
    padding: 2rem 1rem;
    background: rgba(128, 128, 128, 0.05);
    border-left: 1px solid var(--border);
    height: 100vh;
    overflow: auto;
    @media (min-width: 1920px) {
      width: 25rem;
    }
  }
</style>

