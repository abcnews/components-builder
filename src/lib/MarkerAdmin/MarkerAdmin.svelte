<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { slide } from "svelte/transition";

  let {
    /** Unique project name used in localStorage (e.g. "elections-federal2025-lower-house")*/
    projectName = "dev",
    defaultMarkerName = () => "",
    prefixes = {
      "Scrolly mark": "#mark",
      "Scrolly opener": "#scrollytellerNAMEscrolly1",
      "Standalone graphic": "#graphic",
    },
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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    class="bi bi-floppy"
    viewBox="0 0 16 16"
  >
    <title>Save</title>
    <path d="M11 2H9v3h2z" />
    <path
      d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"
    />
  </svg>
{/snippet}

{#snippet copyIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    class="bi bi-copy"
    viewBox="0 0 16 16"
  >
    <title>Copy to clipboard</title>
    <path
      fill-rule="evenodd"
      d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
    />
  </svg>
{/snippet}

{#snippet pasteIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    class="bi bi-clipboard"
    viewBox="0 0 16 16"
  >
    <title>Paste marker from clipboard</title>
    <path
      d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"
    />
    <path
      d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"
    />
  </svg>
{/snippet}

{#snippet deleteIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    class="bi bi-trash"
    viewBox="0 0 16 16"
  >
    <path
      d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
    />
    <path
      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
    />
  </svg>
{/snippet}

{#snippet undeleteIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    class="bi bi-arrow-counterclockwise"
    viewBox="0 0 16 16"
  >
    <path
      fill-rule="evenodd"
      d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"
    />
    <path
      d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"
    />
  </svg>
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
      Object.keys(prefixes).forEach(
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
          <button
            onclick={(e) => {
              e.preventDefault();
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
