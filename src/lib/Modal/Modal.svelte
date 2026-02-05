<script lang="ts">
  import { onMount } from "svelte";
  import { X } from "svelte-bootstrap-icons";

  let {
    children,
    footerChildren,
    title = "",
    onClose = () => {},
    position = "centre",
  } = $props<{
    children?: any;
    footerChildren?: any;
    title?: string;
    onClose?: () => void;
    position?: string;
  }>();
  let dialogEl = $state<HTMLDialogElement | undefined>();
  let rect = $state<DOMRect>();
  $effect(() => {
    if (dialogEl) {
      rect = dialogEl.getBoundingClientRect();
    }
  });
  onMount(() => {
    dialogEl?.showModal();
    return () => {
      dialogEl?.close();
    };
  });

  function onCloseTypescriptProxy(e) {
    if (e.target === dialogEl) {
      onClose();
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- We must track clicks on the modal so clicking the backdrop can close it. This is not an accessibility issue. -->
<dialog
  bind:this={dialogEl}
  class="modal modal--{position}"
  onclick={onCloseTypescriptProxy}
  onclose={onCloseTypescriptProxy}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div onclick={(e) => e.stopPropagation()}>
    {#if title}
      <div class="modal-title">
        <h1>
          {title}
        </h1>
        <button class="modal-close" onclick={onCloseTypescriptProxy}>
          <X />
        </button>
      </div>
    {/if}

    <div class="modal-content">
      {@render children?.()}
    </div>
    {#if footerChildren}
      <div class="modal-footer">
        {@render footerChildren?.()}
      </div>
    {/if}
  </div>
</dialog>

<style>
  .modal {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    padding: 0;
    background: var(--background);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    animation: fadein 0.2s;
    &::backdrop {
      animation: fadein 0.2s;
      background: rgba(0, 0, 0, 0.8);
    }
  }
  .modal--right {
    left: 100%;
    transform: translate(calc(-100% - 2rem), -50%);
    &::backdrop {
      animation: fadein 0.2s;
      background: linear-gradient(to left, rgba(0, 0, 0, 0.8), transparent 50%);
    }
  }

  .modal-title {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    gap: 1rem;
    border-bottom: 1px solid var(--border);
  }
  .modal-title h1 {
    font-size: 1rem;
    margin: 0;
    padding: 0;
    flex: 1;
  }
  button.modal-close {
    width: 2rem;
    border: none;
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-content {
    padding: 0.5rem 1rem;
    max-height: 50vh;
    overflow: hidden auto;
  }
  .modal-footer {
    text-align: right;
    border-top: 1px solid var(--border);
    padding: 0.5rem 1rem;
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
