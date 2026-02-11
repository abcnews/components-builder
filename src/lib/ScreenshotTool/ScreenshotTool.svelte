<script lang="ts">
  import { untrack } from "svelte";
  import JSZip from "jszip";
  import { eachLimit } from "async";
  import Modal from "$lib/Modal/Modal.svelte";
  import saveAs from "./saveAs.js";
  import {
    defaultMarkerNameDefault,
    prefixesDefault,
  } from "$lib/shared-defaults.js";

  interface Props {
    defaultMarkerName: DefaultMarkerNameFunction;
    prefixes: MarkerPrefixes;
    onMarker: (marker: string) => string;
    iframeUrl: string;
  }

  type PreviewConfig = { name: string; marker: string; markerString: string };

  const GENERATOR_URL = "https://fallback-automations-yknow.kyd.au/api";
  const GENERATOR_MAX_PARALLEL = 3;
  const GENERATOR_WIDTH = "1000";

  let {
    defaultMarkerName = defaultMarkerNameDefault,
    prefixes = prefixesDefault,
    // Optional function to process markers
    onMarker = (str: string) => str,
    iframeUrl = "",
  }: Props = $props();

  // closed => pasting => preview => generate => done
  let status = $state("closed");
  let pastedState: string = $state("");
  let preview: PreviewConfig[] = $state([]);
  let progress = $state(0);
  let error = $state("");

  // When the user first hits the "preview" screen, parse our textarea and show them a preview
  $effect(() => {
    (async () => {
      let _pastedState = untrack(() => pastedState);
      let _status = status;
      if (_status !== "preview") {
        return;
      }
      const allowedPrefixes = Object.values(prefixes).map((prefix) =>
        prefix.replace(/\d$/, ""),
      );

      // Find markers in the text
      const markers = _pastedState
        .split("\n")
        .filter((row) =>
          allowedPrefixes.find(
            (prefix) => row.slice(0, prefix.length) === prefix,
          ),
        );

      const uniqueMarkers = Array.from(new Set(markers));

      // pass through schema
      const parsedMarkers = await Promise.all(uniqueMarkers.map(onMarker));

      // generate a friendly name
      preview = await Promise.all(
        parsedMarkers.map(async (marker: string) => ({
          name: defaultMarkerName(marker),
          marker,
          markerString: "#" + marker,
        })),
      );
    })();
  });

  async function doFetch(generatorUrl: string) {
    const response = await fetch(generatorUrl);
    if (response.status !== 200) {
      return null;
    }
    return response.blob();
  }

  async function sleep(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds));
  }

  async function retry<T extends () => Promise<any>>(
    fn: T,
    attempt: number = 0,
  ): Promise<Awaited<ReturnType<T>>> {
    let result = await fn();
    if (!result && attempt < 5) {
      await sleep(1000 * 2 * attempt);
      return retry(fn, attempt + 1);
    }
    return result;
  }

  async function createScreenshots({ preview }: { preview: PreviewConfig[] }) {
    const zip = new JSZip();
    let completed = 0;
    // Put a little bit in the bar at the start so it's clear what it is.
    progress = 0.5 / preview.length;
    error = "";
    const imageBlobs: (Blob | null)[] = [];
    await eachLimit(
      preview,
      GENERATOR_MAX_PARALLEL,
      async ({ markerString }, callback) => {
        const thisIframeUrl = iframeUrl + markerString;
        const generatorUrl = [
          GENERATOR_URL,
          new URLSearchParams({
            url: thisIframeUrl,
            selector: `.iframe-mount > *`,
            width: GENERATOR_WIDTH,
          }).toString(),
        ].join("?");

        const blob = await retry(() => doFetch(generatorUrl));

        completed += 1;
        progress = completed / preview.length;

        imageBlobs.push(blob);
        callback();
      },
    );

    const errors: string[] = [];
    imageBlobs.forEach((blob, index) => {
      const filename = `${String(index).padStart(3, "0")}-${preview[index].name}.png`;
      if (blob) {
        zip.file(filename, blob);
      } else {
        errors.push(filename);
      }
    });

    if (errors.length) {
      status = "error";
      if (errors.length === imageBlobs.length) {
        error =
          "Could not download files. The fallback service may not be running.";
        return;
      } else if (errors.length) {
        error =
          "Error: could not download some files. These might be missing from the zip:\n\n" +
          errors.join("\n");
      }
    }

    return zip.generateAsync({ type: "blob" }).then((content) => {
      if (!errors.length) {
        status = "complete";
      }
      saveAs(content, `fallback-bundle-${Date.now()}.zip`);
    });
  }

  // When the user first hits the "generate" screen, call createScreenshot()
  $effect(() => {
    let _preview = untrack(() => preview);
    let _status = status;
    if (_status !== "generate") {
      return;
    }
    createScreenshots({ preview: _preview });
  });

  function onClose() {
    status = "closed";
  }
</script>

<button
  onclick={(e) => {
    e.preventDefault();
    status = "pasting";
    pastedState = "";
  }}
>
  Screenshot tool
</button>

{#snippet footerChildren()}
  {#if status === "preview"}
    <button
      onclick={(e) => {
        e.preventDefault();
        status = "pasting";
      }}
    >
      Back
    </button>
  {/if}
  <button
    disabled={status === "generate"}
    onclick={(e) => {
      e.preventDefault();
      switch (status) {
        case "error":
          status = "closed";
          return;
        case "pasting":
          status = "preview";
          return;
        case "preview":
          status = "generate";
          return;
        default:
          status = "closed";
      }
    }}
  >
    {#if status === "preview"}
      Generate screenshots
    {:else if status === "error" || status === "complete"}
      Close
    {:else}
      Next
    {/if}
  </button>
{/snippet}

{#if status !== "closed"}
  <Modal title="Screenshot tool" {onClose} {footerChildren}>
    <div class="screenshot-tool">
      {#if status === "pasting"}
        <p>Paste your story, or a series of markers to create screenshots</p>
        <textarea bind:value={pastedState} placeholder="#markVER1"></textarea>
      {/if}

      {#if status === "preview"}
        <p>
          This will create {preview.length} screenshot{preview.length === 1
            ? ""
            : "s"}:
        </p>
        <table class="builder__table">
          <thead>
            <tr><th>#</th><th>Marker</th><th>Marker</th></tr>
          </thead>
          <tbody>
            {#each preview as { name, markerString }, i}
              <tr
                ><td>{i + 1}</td><td>{name}</td><td
                  ><code class="marker">{markerString}</code></td
                ></tr
              >
            {/each}
          </tbody>
        </table>
      {/if}

      {#if status === "generate"}
        <p>Generating screenshots. This may take some time.</p>
        <progress max="100" value={Math.round(progress * 100)}></progress>
      {/if}

      {#if status === "error"}
        <p>{error}</p>
      {/if}

      {#if status === "complete"}
        <p>
          Your screenshots are finished. Check for the zip file in your
          Downloads folder.
        </p>
      {/if}
    </div>
  </Modal>
{/if}

<style>
  .screenshot-tool {
    width: 100vw;
    max-width: 640px;
    position: relative;
    height: 100vh;
    max-height: 200px;
  }
  textarea {
    min-height: 150px;
  }
  table,
  progress,
  textarea {
    width: calc(100% - 2px);
  }
  table {
    max-width: calc(100% - 2px);
  }

  .marker {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    max-width: 20em;
  }
</style>
