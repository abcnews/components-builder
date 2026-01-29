<script lang="ts">
  import { onMount } from "svelte";

  let { position = [0, 0], children, onClose = () => {} } = $props();
  let dialogEl = $state<HTMLDialogElement | undefined>();
  let rect = $state<DOMRect>();
  onMount(() => {
    if (!dialogEl) {
      // the dialog will always exist, but Typescript doesn't know that.
      return;
    }
    dialogEl?.showModal();
    rect = dialogEl.getBoundingClientRect();
    return () => {
      dialogEl?.close();
    };
  });

  /* Proxy required otherwise Typescript complains */
  function onCloseTypescriptProxy() {
    onClose();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  class="dialog"
  bind:this={dialogEl}
  style:left={rect
    ? (rect.width + position[0] > window.innerWidth
        ? window.innerWidth - rect.width
        : position[0]) + "px"
    : ""}
  style:top={rect
    ? (rect.height + position[1] > window.innerHeight
        ? window.innerHeight - rect.height - 10
        : position[1]) + "px"
    : ""}
  onclick={onCloseTypescriptProxy}
  onclose={onCloseTypescriptProxy}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div onclick={(e) => e.stopPropagation()}>{@render children?.()}</div>
</dialog>

<style>
  .dialog {
    left: 0;
    top: 0;
    margin: 0;
    padding: 0;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    animation: fadein 0.2s;
  }

  .dialog::backdrop {
    animation: fadein 0.2s;
    background: rgba(0, 0, 0, 0.05);
  }

  :global {
    .dialog .menu {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .dialog .menu--double {
      display: grid;
      grid-template-columns: 50% 50%;
      gap: 0.25rem;
    }

    .dialog .menu--double li {
      white-space: nowrap;
    }

    .dialog .section {
      padding: 0.75rem;
    }

    .dialog .item,
    .dialog button.item {
      display: block;
      width: 100%;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      margin: 0 !important;
      font-size: 1rem;
    }

    .dialog .item:focus-visible,
    .dialog .item:hover,
    .dialog button.item:focus-visible,
    .dialog button.item:hover {
      background: Highlight;
      color: HighlightText;
    }

    .dialog hr {
      border: none;
      margin: 0;
      padding: 0;
      border-bottom: 1px solid var(--border);
    }
  }

  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
