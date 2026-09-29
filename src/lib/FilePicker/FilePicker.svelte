<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    value = $bindable(""),
    file = $bindable(undefined),
    types = "*",
    readAsText = true,
    children,
  }: {
    value?: string;
    file?: File | undefined;
    types?: string;
    readAsText?: boolean;
    children?: Snippet;
  } = $props();

  /** Whether a file is currently being dragged over the drop zone. */
  let dragging = $state(false);

  /** Reference to the hidden native file input. */
  let inputEl: HTMLInputElement | undefined = $state();

  /** Opens the native file picker via the hidden input. */
  function openFilePicker() {
    inputEl?.click();
  }

  /** Reads a File object and resolves with its text contents. */
  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /** Loads a File and assigns its text contents to value. */
  async function loadFile(loadedFile: File) {
    file = loadedFile;
    if (readAsText) {
      value = await readFileAsText(loadedFile);
    }
  }

  /** Handles a dragover event on the drop zone, preventing the default browser behaviour and highlighting it. */
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragging = true;
  }

  /** Clears the drop zone's drag highlight. */
  function handleDragLeave() {
    dragging = false;
  }

  /** Handles a drop event on the drop zone by loading the dropped file. */
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      loadFile(file);
    }
  }

  /** Handles a change event on the file input by loading the chosen file. */
  function handleFileInputChange(
    event: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) {
    const file = event.currentTarget.files?.[0];
    if (file) {
      loadFile(file);
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- This is handled by the input -->
<div
  class="dropzone"
  class:dragging
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  {#if children}
    {@render children()}
  {:else}
    <p>Drag & drop or choose a file:</p>
  {/if}
  <button type="button" onclick={openFilePicker}>Choose file</button>
  <input
    bind:this={inputEl}
    type="file"
    accept={types}
    onchange={handleFileInputChange}
    hidden
  />
</div>

<style>
  .dropzone {
    border: 5px solid transparent;
    padding: 1rem;
  }
  .dropzone.dragging {
    border: 5px dashed var(--accent-color, AccentColor);
  }
  p {
    margin: 0 0 0.5rem;
  }
</style>
