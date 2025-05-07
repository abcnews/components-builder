<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Example/BuilderStyleRoot",
    component: BuilderStyleRoot,
    tags: ["autodocs"],
    argTypes: {},
    args: {},
  });
</script>

{#snippet children()}
  <fieldset>
    <legend>A fieldset</legend>
    <label>
      <input type="checkbox" />
      Show totals
    </label>

    <label>
      <input type="checkbox" />
      Combine Coalition
    </label>

    <label>
      Your name
      <input type="text" />
    </label>
  </fieldset>

  <fieldset>
    <legend>More controls</legend>

    <label>
      Dinner hero
      <select>
        <option>Banana</option>
        <option>Apple</option>
        <optgroup label="Greens">
          <option>Leek</option>
          <option>Bean</option>
        </optgroup>
        <optgroup label="Other">
          <option>Tomato</option>
          <option>Cucumber</option>
        </optgroup>
      </select>
    </label>

    <button>A full-width button</button>
  </fieldset>

  <fieldset>
    <legend>Button groups</legend>
    <div class="btn-group">
      <button>Never</button>
      <button>Gonna</button>
      <button>Give</button>
      <button>You</button>
      <button>Up</button>
    </div>
  </fieldset>

  <fieldset>
    <legend>Inline fields</legend>
    <div class="builder__inline">
      <div>
        <select>
          <option>Export</option>
          <option>Import</option>
        </select>
      </div>
      <label>
        <input type="checkbox" />
        Show totals
      </label>
      <div>
        <button>Go for it</button>
      </div>
    </div>
  </fieldset>

  <fieldset>
    <legend>
      <button class="btn-icon" title="Clear focuses" aria-label="Clear focuses">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-trash"
          viewBox="0 0 16 16"
          role="img"
        >
          <path
            d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
          />
          <path
            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
          />
        </svg>
      </button>
      With button
    </legend>

    <div>
      Although you can put btn-icon buttons anywhere. Consider using <a
        href="https://icons.getbootstrap.com/"
        >https://icons.getbootstrap.com/</a
      >
      or the corresponding <code>svelte-bootstrap-icons</code> package.
    </div>
    <hr />
    <div class="btn-group">
      {#each [1, 2, 3, 4]}
        <button
          class="btn-icon"
          title="Clear focuses"
          aria-label="Clear focuses"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-trash"
            viewBox="0 0 16 16"
            role="img"
          >
            <path
              d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
            />
            <path
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
            />
          </svg>
        </button>
      {/each}
    </div>
  </fieldset>
  <fieldset>
    <legend>Tables</legend>
    <table class="builder__table">
      <thead>
        <tr><th>Item</th><th>Amount</th><th>Price</th></tr>
      </thead>
      <tbody>
        <tr
          ><td>Cake</td><td class="builder__digit">1</td><td
            class="builder__digit">$2.50</td
          ></tr
        >
        <tr
          ><td>Prawns</td><td class="builder__digit">13</td><td
            class="builder__digit">$800</td
          ></tr
        >
        <tr
          ><td>Scissors</td><td class="builder__digit">2</td><td
            class="builder__digit">$11.48</td
          ></tr
        >
      </tbody>
    </table>
  </fieldset>

  <fieldset>
    <legend>Submit row</legend>
    <p>This is more useful in modals:</p>
    <div class="builder__submit-row">
      <button>Back</button>
      <button>Next</button>
    </div>
  </fieldset>
{/snippet}

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Primary"
  args={{
    children: children,
  }}
/>
