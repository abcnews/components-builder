<script lang="ts">
  import {
    defaultMarkerNameDefault,
    prefixesDefault,
  } from "$lib/shared-defaults.js";
  import { onMount, untrack } from "svelte";
  import { slide } from "svelte/transition";
  import {
    Floppy,
    Copy,
    Clipboard,
    Trash,
    ArrowCounterclockwise,
  } from "svelte-bootstrap-icons";

  let {
    /** Unique project name used in localStorage (e.g. "elections-federal2025-lower-house")*/
    projectName = "dev",
    defaultMarkerName = defaultMarkerNameDefault,
    prefixes = prefixesDefault,
  } = $props();

  type Marker = {
    /** human readable name */
    name: string;
    /** actual marker string */
    hash: string;
    /** Date at which the marker was deleted (for undo) */
    deleted?: number;
  };

  let hasLoaded = $state(false);
  let markers = $state<Marker[]>([]);
  let mode = $state(untrack(() => Object.keys(prefixes)?.[0]));

  /** which button should show the success indicator */
  let successIndicator = $state("");

  const [version = "0.0.0"] =
    window.location.pathname
      .match(/\/news-projects\/[^/]+\/(\d+\.\d+\.\d+)/)
      ?.slice(1) || [];
  const localStorageKey = $derived(
    `ABC_NEWS_BUILDER_${projectName.toUpperCase().replace(/-/g, "_")}`,
  );

  /** Load & sanitise markers from localStorage on initial load */
  $effect(() => {
    let _markers = markers;
    if (!hasLoaded) {
      return;
    }
    try {
      console.log("writing localStorage");
      localStorage[localStorageKey] = JSON.stringify({
        version: version,
        lastUpdated: new Date().toISOString(),
        expiry: 2026,
        markers: _markers,
      });
    } catch (e) {
      alert("Could not save markers: " + (e as Error).message);
    }
  });

  /* ---------------------------------------------------------------------------
   * slightly more complex delete logic than I hoped. When an item is marked
   * as deleted, set a timer and actually delete it after ~5sec.
   * don't delete while the user is still hovering the items.
   */
  let isHovering = $state(false);
  let interval = $state<NodeJS.Timeout>();
  function clearDeleteCleanup() {
    const _interval = untrack(() => interval);
    if (_interval) {
      clearInterval(_interval);
      interval = undefined;
    }
  }
  $effect(() => {
    const _markers = untrack(() => markers);

    clearDeleteCleanup();
    if (isHovering) {
      return;
    }

    interval = setInterval(() => {
      const goodMarkers = (marker: Marker) =>
        !marker.deleted || marker.deleted > Date.now() - 5000;
      if (!_markers.every(goodMarkers)) {
        markers = _markers.filter(goodMarkers);
      }
    }, 3000);
  });

  onMount(function load() {
    try {
      const storage = localStorage[localStorageKey];
      if (!storage) {
        hasLoaded = true;
        return;
      }
      const parsedStorage = JSON.parse(storage);
      markers = parsedStorage.markers;
    } catch (e) {
      alert("Could not load saved markers: " + (e as Error).message);
    }
    hasLoaded = true;

    return () => {
      clearDeleteCleanup();
    };
  });
</script>

{#snippet saveIcon()}
  <Floppy width="16" height="16" />
{/snippet}

{#snippet copyIcon()}
  <Copy width="16" height="16" />
{/snippet}

{#snippet pasteIcon()}
  <Clipboard width="16" height="16" />
{/snippet}

{#snippet deleteIcon()}
  <Trash width="16" height="16" />
{/snippet}

{#snippet undeleteIcon()}
  <ArrowCounterclockwise width="16" height="16" />
{/snippet}

<div class="toolbar">
  <select bind:value={mode}>
    {#each Object.keys(prefixes) as prefix}
      <option>{prefix}</option>
    {/each}
  </select>
  <button
    title="Copy marker"
    class:success={successIndicator === "copy"}
    onanimationend={() => {
      successIndicator = "";
    }}
    onclick={(e) => {
      e.preventDefault();
      const hash = window.location.hash.slice(1);
      navigator.clipboard.writeText(prefixes[mode] + hash);
      successIndicator = "copy";
    }}
  >
    {@render copyIcon()}
  </button>
  <button
    title="Paste marker from clipboard"
    class:success={successIndicator === "paste"}
    onanimationend={() => {
      successIndicator = "";
    }}
    onclick={async (e) => {
      e.preventDefault();

      let text: string | null = await navigator.clipboard
        .readText()
        .catch((e) => {
          console.error("Could not read clipboard");
          return null;
        });

      if (!text) {
        text = prompt("Paste a marker here to import its configuration");
      }

      if (!text) {
        return;
      }

      let sanitisedMarker = text;
      Object.values(prefixes).forEach(
        (prefix) => (sanitisedMarker = sanitisedMarker.replace(prefix, "")),
      );

      if (window.location.hash.slice(1) === sanitisedMarker) {
        alert(
          "Pasted marker is the same as the current state. No changes were necessary.",
        );
        return;
      }

      window.location.hash = sanitisedMarker;

      successIndicator = "paste";
    }}
  >
    {@render pasteIcon()}
  </button>
  <div class="divider"></div>
  <button
    title="Save marker snapshot"
    onclick={(e) => {
      e.preventDefault();
      const name = prompt(
        "What would you like to call this snapshot?",
        defaultMarkerName(),
      );
      if (!name) {
        return;
      }
      markers.push({
        name,
        hash: window.location.hash.slice(1),
      });
    }}
  >
    {@render saveIcon()}
  </button>
</div>

<svelte:window
  onblur={() => {
    isHovering = false;
  }}
/>

<table
  class="saved-markers"
  onmouseenter={() => {
    isHovering = true;
  }}
  onmouseleave={() => {
    isHovering = false;
  }}
>
  <tbody>
    {#each markers as marker, index}
      <tr
        class="row"
        class:row--deleted={marker.deleted}
        transition:slide
        onclick={(e) =>
          //@ts-ignore
          e.target?.querySelector("a")?.click()}
      >
        <td class="name">
          {#if marker.deleted}
            {marker.name}
          {:else}
            <a href={`#${marker.hash}`}>
              {marker.name}
            </a>
          {/if}
        </td>
        <td class="btn-group">
          {#if !marker.deleted}
            <button
              onclick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm(`Overwrite '${marker.name}'?`)) {
                  marker.hash = window.location.hash.slice(1);
                }
              }}
              title="Overwrite snapshot with current state"
              style:height="32px"
            >
              {@render saveIcon()}
            </button>
          {/if}
          <button
            onclick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const newMarkers = [...markers];
              const marker = newMarkers[index];
              if (marker.deleted) {
                delete marker.deleted;
              } else {
                marker.deleted = Date.now();
              }
            }}
            title={marker.deleted ? "Undo delete" : "Delete marker"}
            style:height="32px"
          >
            {#if marker.deleted}
              {@render undeleteIcon()}
            {:else}
              {@render deleteIcon()}
            {/if}
          </button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .toolbar {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;

    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);

    .divider {
      border-right: 1px solid var(--border);
    }

    button.success {
      animation: success 1s;
    }
  }

  @keyframes success {
    from {
      outline: 0px solid rgb(114, 191, 114);
    }
    to {
      outline: 10px solid rgb(114, 191, 114, 0);
    }
  }

  .saved-markers {
    &,
    tr,
    td,
    tbody {
      margin: 0;
      padding: 0;
      display: block;
    }
    tbody {
      width: 100%;
    }
    .row {
      display: flex;
      width: 100%;
      border-bottom: 1px solid var(--border);
      width: calc(100% + 1rem);
      margin-left: -0.5rem;
      border-radius: 1px;
      & > * {
        padding: 0.5rem;
      }
      &:not(.row--deleted):hover {
        cursor: pointer;
        background: Highlight;
        color: HighlightText;
      }
    }
    .row a {
      text-decoration: none;
      color: inherit;
      &:focus-visible {
        text-decoration: underline;
      }
    }
    .name {
      flex: 1;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }

    .row--deleted .name {
      opacity: 0.2;
    }
  }
</style>
