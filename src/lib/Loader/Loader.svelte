<script lang="ts">
  /**
   * @file
   * A loading spinner
   */
  let { width = "32px", children = null } = $props();
</script>

<div class="loader" style:--width={width}>
  <div class="loader__widget"></div>
  <div class="loader__text">{@render children()}</div>
</div>

<style>
  .loader {
    font-family: "abcsans", sans-serif;
    font-size: 1rem;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    animation: fadeIn 1s;
  }
  .loader__widget,
  .loader__widget::after {
    display: block;
    position: relative;
    width: var(--width);
    height: var(--width);
    border: 2px solid currentcolor;
    border-radius: 100%;
    box-sizing: border-box;
  }
  .loader__widget::after {
    content: "";
    display: block;
    border-color: white;
    position: absolute;
    left: -2px;
    top: -2px;
    clip-path: polygon(0 0%, 50% 0, 50% 50%, 0% 50%);
    animation: spin 1.5s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(45deg);
    }
    to {
      transform: rotate(405deg);
    }
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
