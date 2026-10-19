<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import InputDistribution from "./InputDistribution.svelte";
  import { scaleLinear } from "d3-scale";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";

  /** Small seeded PRNG so stories render identically every time. */
  function mulberry32(seed: number) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Box–Muller normal distribution. */
  function normal(n: number, mean: number, sd: number, seed: number) {
    const rand = mulberry32(seed);
    return Array.from({ length: n }, () => {
      const u = 1 - rand();
      const v = rand();
      return (
        mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
      );
    });
  }

  const normalValues = normal(5000, 50, 15, 1);
  const unitValues = normal(3000, 0.5, 0.15, 2).map((v) =>
    Math.min(1, Math.max(0, v)),
  );
  // Heavily right-skewed, so the sqrt vs linear difference is obvious
  const skewedValues = (() => {
    const rand = mulberry32(3);
    return Array.from({ length: 5000 }, () => -Math.log(1 - rand()) * 20);
  })();
  const bimodalValues = [...normal(2500, 25, 6, 4), ...normal(2500, 75, 8, 5)];
  const largeValues = normal(500_000, 0, 1000, 6);

  /** Multi-stop colour scale used by the "Coloured by value" story. */
  const palette = scaleLinear<string>()
    .domain([0, 33, 66, 100])
    .range(["#fde725", "#35b779", "#31688e", "#440154"])
    .clamp(true);

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
      values: normalValues,
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
  // `min` and `max` are bindable, and Storybook args don't write back,
  // so each interactive story keeps its own local state.
  let primaryMin = $state<number | undefined>();
  let primaryMax = $state<number | undefined>();

  let selectedMin = $state<number | undefined>(40);
  let selectedMax = $state<number | undefined>(65);

  let unitMin = $state<number | undefined>(0.25);
  let unitMax = $state<number | undefined>(0.75);

  let skewMin = $state<number | undefined>(10);
  let skewMax = $state<number | undefined>(60);

  let bimodalMin = $state<number | undefined>(10);
  let bimodalMax = $state<number | undefined>(40);

  let percentMin = $state<number | undefined>(0.2);
  let percentMax = $state<number | undefined>(0.8);

  let largeMin = $state<number | undefined>(-500);
  let largeMax = $state<number | undefined>(500);

  let emptyMin = $state<number | undefined>();
  let emptyMax = $state<number | undefined>();

  let multiAMin = $state<number | undefined>(30);
  let multiAMax = $state<number | undefined>(60);
  let multiBMin = $state<number | undefined>(0.1);
  let multiBMax = $state<number | undefined>(0.4);
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
      <InputDistribution
        {...args}
        bind:min={primaryMin}
        bind:max={primaryMax}
      />
      {@render readout(primaryMin, primaryMax)}
    </div>
  {/snippet}
</Story>

<Story name="Preselected range">
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution
        {...args}
        bind:min={selectedMin}
        bind:max={selectedMax}
      />
      {@render readout(selectedMin, selectedMax)}
    </div>
  {/snippet}
</Story>

<!-- Exercises the default step logic, which should snap to 0.01 rather than integers -->
<Story name="Zero to one data" args={{ values: unitValues }}>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={unitMin} bind:max={unitMax} />
      {@render readout(unitMin, unitMax)}
    </div>
  {/snippet}
</Story>

<Story
  name="Skewed data (sqrt scale)"
  args={{ values: skewedValues, scale: "sqrt" }}
>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={skewMin} bind:max={skewMax} />
      {@render readout(skewMin, skewMax)}
    </div>
  {/snippet}
</Story>

<Story
  name="Skewed data (linear scale)"
  args={{ values: skewedValues, scale: "linear" }}
>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={skewMin} bind:max={skewMax} />
      {@render readout(skewMin, skewMax)}
    </div>
  {/snippet}
</Story>

<Story name="Bimodal data" args={{ values: bimodalValues, height: 90 }}>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution
        {...args}
        bind:min={bimodalMin}
        bind:max={bimodalMax}
      />
      {@render readout(bimodalMin, bimodalMax)}
    </div>
  {/snippet}
</Story>

<!-- Each bar is coloured from its bin midpoint, e.g. to preview a colour scale over the data -->
<Story
  name="Coloured by value"
  args={{
    values: normalValues,
    color: (value: number) => palette(value),
  }}
>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution
        {...args}
        bind:min={selectedMin}
        bind:max={selectedMax}
      />
      {@render readout(selectedMin, selectedMax)}
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
      <InputDistribution
        {...args}
        bind:min={percentMin}
        bind:max={percentMax}
      />
      {@render readout(percentMin, percentMax)}
      <p style="font-size: 0.85em; opacity: 0.7;">
        Hover or focus a handle for the formatted tooltip, and check the
        slider's
        <code>aria-valuetext</code>.
      </p>
    </div>
  {/snippet}
</Story>

<Story name="Custom step" args={{ values: normalValues, step: 5 }}>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution
        {...args}
        bind:min={selectedMin}
        bind:max={selectedMax}
      />
      {@render readout(selectedMin, selectedMax)}
      <p style="font-size: 0.85em; opacity: 0.7;">
        Drag and arrow keys snap to multiples of 5.
      </p>
    </div>
  {/snippet}
</Story>

<!-- Confirms reduce() avoids the Math.min(...values) call stack overflow -->
<Story name="Large dataset (500k values)" args={{ values: largeValues }}>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution {...args} bind:min={largeMin} bind:max={largeMax} />
      {@render readout(largeMin, largeMax)}
    </div>
  {/snippet}
</Story>

<Story name="Without number inputs" args={{ showInputs: false }}>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution
        {...args}
        bind:min={selectedMin}
        bind:max={selectedMax}
      />
      {@render readout(selectedMin, selectedMax)}
    </div>
  {/snippet}
</Story>

<Story name="Disabled" args={{ disabled: true }}>
  {#snippet template(args)}
    <div style="max-width: 420px">
      <InputDistribution
        {...args}
        bind:min={selectedMin}
        bind:max={selectedMax}
      />
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
      <fieldset>
        <legend>Temperature</legend>
        <InputDistribution
          {...args}
          values={normalValues}
          bind:min={multiAMin}
          bind:max={multiAMax}
        />
      </fieldset>
      <fieldset>
        <legend>Rainfall ratio</legend>
        <InputDistribution
          {...args}
          values={unitValues}
          bind:min={multiBMin}
          bind:max={multiBMax}
        />
      </fieldset>
      <p style="margin: 0; font-size: 0.85em; opacity: 0.7;">
        Clicking each "Min" label should focus only its own input.
      </p>
    </div>
  {/snippet}
</Story>
