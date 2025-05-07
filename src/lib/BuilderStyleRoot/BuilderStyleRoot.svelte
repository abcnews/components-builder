<script lang="ts">
  let { children } = $props();
</script>

<div class="builder-style-root">
  {@render children?.()}
</div>

<svelte:head>
  <style>
    :root {
      color-scheme: dark light;
    }
    .builder-style-root {
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      font-weight: 400;

      --text: #222;
      --text-light: #888;
      --background: #fff;
      --border: rgba(122, 123, 135, 0.5);
      --background-alt: #f2f4f5;

      color: var(--text);
      background-color: var(--background);

      font-synthesis: none;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-text-size-adjust: 100%;

      color-scheme: dark light;
    }

    @media (prefers-color-scheme: dark) {
      .builder-style-root {
        --text: #ccc;
        --text-light: #888;
        --background: #1a1a1a;
        --background-alt: #2c2c2f;
        --border: rgba(122, 123, 135, 0.5);
      }
    }

    /* // builder-style-root */
    .builder-style-root {
      * {
        box-sizing: border-box;
      }
      fieldset {
        margin-bottom: 1rem;
        padding: var(--padding);
        border: 1px solid var(--border);
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .fieldset {
        padding: 0 var(--padding);
        border: 1px solid transparent;
      }
      .fieldset,
      fieldset {
        --padding: 0.75rem;
        margin-bottom: 1rem;
        border-radius: 0.2rem;
      }
      fieldset.builder__spacious,
      .fieldset.builder__spacious {
        --padding: 1rem;
        legend {
          font-weight: bold;
        }
      }
      .btn-group {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .builder__inline {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      label {
        margin-bottom: 0.5rem;
        position: relative;
      }
      label span {
        display: block;
        margin-bottom: 0.3rem;
      }

      select,
      button,
      input,
      textarea {
        padding: 0.25rem 0.5rem;
        background: var(--background);
        border: 1px solid var(--border);
        color: var(--text);
        border-radius: 0.2rem;
      }
      select:not([multiple]),
      button:not(:disabled) {
        cursor: pointer;
        &:hover,
        &:focus-visible {
          border-color: var(--text);
          background: Highlight;
          color: HighlightText;
        }
      }
      button:disabled {
        color: var(--text-light);
      }

      select,
      input[type="text"],
      input[type="password"],
      textarea {
        width: 100%;
      }

      .btn-icon {
        padding: 0;
        display: inline-flex;
        height: 1.5rem;
        width: 1.5rem;
        justify-content: center;
        align-items: center;
      }

      .builder__submit-row {
        text-align: right;
        border-top: 1px solid var(--border);
        padding: 0.5rem 0;
      }
      hr {
        width: 100%;
        border: none;
        border-bottom: 1px solid var(--border);
      }

      table.builder__table {
        border-collapse: separate;
        border: solid var(--border) 1px;
        border-radius: 0.2rem;
        border-spacing: 0;

        td,
        th {
          border-left: solid var(--border) 1px;
          border-top: solid var(--border) 1px;
          padding: 0.25rem 0.5rem;
        }

        th {
          background-color: var(--background-alt);
        }

        th {
          border-top: none;
        }

        td:first-child,
        th:first-child {
          border-left: none;
        }
      }

      .builder__digit {
        text-align: right;
        font-family: monospace;
      }
    }
  </style>
</svelte:head>
