<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import InputDistribution from "./InputDistribution.svelte";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";

  /**
   * Deterministic sample data: just a lil sine wave
   */
  const wave = (n: number, max = 100, skew = 1) =>
    Array.from({ length: n }, (_, i) => max * ((1 + Math.sin(i)) / 2) ** skew);

  const values = wave(5000);
  const unitValues = wave(3000, 1);
  const skewedValues = wave(5000, 100, 3);
  const largeValues = wave(500_000);

  const { Story } = defineMeta({
    title: "Example/InputDistribution",
    component: InputDistribution,
    tags: ["autodocs"],
    argTypes: {
      values: { control: false },
      min: { control: false },
      max: { control: false },
      color: { control: "color" },
      scale: { control: "inline-radio", options: ["sqrt", "linear"] },
      bins: { control: { type: "number", min: 5, max: 200, step: 5 } },
      height: { control: { type: "number", min: 30, max: 200, step: 10 } },
      step: { control: "number" },
      showInputs: { control: "boolean" },
      disabled: { control: "boolean" },
    },
    args: {
      values,
      bins: 100,
      scale: "sqrt",
      height: 60,
      showInputs: true,
      disabled: false,
    },
    // @ts-expect-error This is apparently a bug https://github.com/storybookjs/storybook/issues/29951
    decorators: [() => BuilderStyleRoot],
  });
</script>

<script lang="ts">
  // `min` and `max` are bindable and Storybook args don't write back,
  // so stories keep local state. Stories with similar data share a pair.
  let emptyMin = $state<number | undefined>();
  let emptyMax = $state<number | undefined>();
  let rangeMin = $state<number | undefined>(40);
  let rangeMax = $state<number | undefined>(65);
  let unitMin = $state<number | undefined>(0.25);
  let unitMax = $state<number | undefined>(0.75);
</script>

{#snippet readout(min: number | undefined, max: number | undefined)}
  <p style="margin: 0; font-size: 0.85em; opacity: 0.7;">
    <code>min = {min ?? "undefined"}</code>,
    <code>max = {max ?? "undefined"}</code>
  </p>
{/snippet}

<!-- Both bounds start undefined; handles sit at the data extents until dragged -->
<Story name="Primary">
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={emptyMin} bind:max={emptyMax} />
      {@render readout(emptyMin, emptyMax)}
    </div>
  {/snippet}
</Story>

<Story name="Preselected range">
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={rangeMin} bind:max={rangeMax} />
      {@render readout(rangeMin, rangeMax)}
    </div>
  {/snippet}
</Story>

<!-- Default step should snap to 0.01 rather than integers -->
<Story name="Zero to one data" args={{ values: unitValues }}>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={unitMin} bind:max={unitMax} />
      {@render readout(unitMin, unitMax)}
    </div>
  {/snippet}
</Story>

<Story
  name="Skewed (sqrt scale)"
  args={{ values: skewedValues, scale: "sqrt" }}
>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={rangeMin} bind:max={rangeMax} />
    </div>
  {/snippet}
</Story>

<Story
  name="Skewed (linear scale)"
  args={{ values: skewedValues, scale: "linear" }}
>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={rangeMin} bind:max={rangeMax} />
    </div>
  {/snippet}
</Story>

<!-- Each bar is coloured from its bin midpoint -->
<Story
  name="Coloured by value"
  args={{ color: (value: number) => `hsl(${value * 2.4}, 70%, 50%)` }}
>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={rangeMin} bind:max={rangeMax} />
    </div>
  {/snippet}
</Story>

<Story
  name="Formatted values"
  args={{
    values: unitValues,
    formatValue: (v: number) => `${Math.round(v * 100)}%`,
    minLabel: "From",
    maxLabel: "To",
  }}
>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={unitMin} bind:max={unitMax} />
      {@render readout(unitMin, unitMax)}
    </div>
  {/snippet}
</Story>

<!-- Confirms reduce() avoids the Math.min(...values) call stack overflow -->
<Story name="Large dataset (500k values)" args={{ values: largeValues }}>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={rangeMin} bind:max={rangeMax} />
    </div>
  {/snippet}
</Story>

<Story name="Disabled" args={{ disabled: true }}>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={rangeMin} bind:max={rangeMax} />
    </div>
  {/snippet}
</Story>

<Story name="No data" args={{ values: [] }}>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={emptyMin} bind:max={emptyMax} />
    </div>
  {/snippet}
</Story>

<!-- Checks that input ids don't collide when several instances share a page -->
<Story name="Multiple instances">
  {#snippet template(args)}
    <div
      style="max-width: 420px; display: flex; flex-direction: column; gap: 1rem;"
    >
      <InputDistribution {...args} bind:min={rangeMin} bind:max={rangeMax} />
      <InputDistribution
        {...args}
        values={unitValues}
        bind:min={unitMin}
        bind:max={unitMax}
      />
      <p style="margin: 0; font-size: 0.85em; opacity: 0.7;">
        Clicking each "Min" label should focus only its own input.
      </p>
    </div>
  {/snippet}
</Story>
