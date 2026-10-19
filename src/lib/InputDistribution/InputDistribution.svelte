<script lang="ts">
  /**
   * @file InputDistribution.svelte
   *
   * Visualises a set of numbers as a histogram and provides draggable,
   * keyboard-accessible handles (plus number inputs) to select a min/max range.
   *
   * `min` and `max` are bindable. `undefined` means "unbounded"; the handle is
   * drawn at the data extent and the bound is only set once the user moves it.
   *
   * Requires `layercake` and `d3-scale` as dependencies.
   */
  import { onDestroy } from "svelte";
  import { LayerCake, Svg, bin } from "layercake";
  import { scaleLinear, scaleSqrt } from "d3-scale";

  interface Bin {
    x0: number;
    x1: number;
    length: number;
  }

  interface Props {
    /** Values to bin. Pass a sample for large datasets. Non-finite values are ignored. */
    values?: number[];
    /** Lower bound of the selected range. `undefined` = unbounded. */
    min?: number | undefined;
    /** Upper bound of the selected range. `undefined` = unbounded. */
    max?: number | undefined;
    /** Drag/arrow-key increment. Defaults to a power of ten ~1/100th of the data range. */
    step?: number;
    /** Number of histogram bins. */
    bins?: number;
    /** Bar height scale. `sqrt` keeps small bins visible next to large ones. */
    scale?: "sqrt" | "linear";
    /** Chart height in px. */
    height?: number;
    /**
     * Bar colour. Either a CSS colour, or a function that receives each bin's midpoint value
     * and returns a CSS colour, e.g. `(v) => myScale(v)` to colour bars by value.
     */
    color?: string | ((value: number) => string);
    /** Formats values for tooltips and `aria-valuetext`. */
    formatValue?: (value: number) => string;
    /** Show the Min/Max number inputs below the chart. */
    showInputs?: boolean;
    minLabel?: string;
    maxLabel?: string;
    disabled?: boolean;
  }

  let {
    values = [],
    min = $bindable(),
    max = $bindable(),
    step,
    bins = 100,
    scale = "sqrt",
    height = 60,
    color = "var(--builder-color-primary, #0070c9)",
    formatValue = (value: number) => String(value),
    showInputs = true,
    minLabel = "Min",
    maxLabel = "Max",
    disabled = false,
  }: Props = $props();

  const uid = $props.id();

  /** Must match the horizontal padding passed to LayerCake. */
  const PADDING = { top: 5, right: 10, bottom: 0, left: 10 };

  let finiteValues = $derived(values.filter((v) => Number.isFinite(v)));

  let binnedData = $derived(
    bin(finiteValues, (d: any) => d as number, {
      thresholds: bins,
    }) as unknown as Bin[],
  );

  // `reduce` rather than `Math.min(...values)`, which overflows the call stack on large arrays.
  let dataDomain = $derived.by<[number, number]>(() => {
    if (finiteValues.length === 0) return [0, 0];
    return finiteValues.reduce<[number, number]>(
      ([lowest, highest], value) => [
        Math.min(lowest, value),
        Math.max(highest, value),
      ],
      [Infinity, -Infinity],
    );
  });

  /** Rounds to a "nice" power of ten a hundredth of the range, so 0–1 data isn't snapped to integers. */
  let effectiveStep = $derived.by(() => {
    if (step) return step;
    const range = dataDomain[1] - dataDomain[0];
    return range > 0 ? Math.pow(10, Math.floor(Math.log10(range / 100))) : 1;
  });

  /** Where the handles sit when a bound is unset. */
  let effMin = $derived(min ?? dataDomain[0]);
  let effMax = $derived(max ?? dataDomain[1]);

  const clamp = (value: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, value));
  const snap = (value: number) =>
    Number((Math.round(value / effectiveStep) * effectiveStep).toPrecision(12));

  const barColor = (d: Bin) =>
    typeof color === "function" ? color((d.x0 + d.x1) / 2) : color;
  /** Colour-by-value needs less transparency for the colours to read accurately. */
  let barOpacity = $derived(typeof color === "function" ? 0.85 : 0.5);

  const getWidth = (d: Bin, xScale: any) =>
    Math.max(0, xScale(d.x1) - xScale(d.x0) - 1); // 1px gap

  /** Ensures small non-zero bins keep a minimum visible height. */
  const getHeight = (d: Bin, yScale: any, totalHeight: number) =>
    d.length === 0 ? 0 : Math.max(2, totalHeight - yScale(d.length));

  type HandleType = "min" | "max";

  /** The subset of LayerCake's `children` snippet props used here. */
  interface CakeProps {
    data: Bin[];
    xScale: any;
    yScale: any;
    height: number;
  }

  let container = $state<HTMLElement>();
  let dragging = $state<HandleType | null>(null);
  let currentXScale: any;

  function onPointerMove(e: PointerEvent) {
    if (!dragging || !container || !currentXScale) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - container.clientLeft - PADDING.left;
    const value = snap(
      clamp(currentXScale.invert(x), dataDomain[0], dataDomain[1]),
    );

    if (dragging === "min") {
      min = Math.min(value, effMax);
    } else {
      max = Math.max(value, effMin);
    }
  }

  function stopDragging() {
    dragging = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopDragging);
    window.removeEventListener("pointercancel", stopDragging);
  }

  function startDragging(e: PointerEvent, type: HandleType, xScale: any) {
    if (disabled) return;
    e.preventDefault();
    dragging = type;
    currentXScale = xScale;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
  }

  onDestroy(() => {
    if (typeof window !== "undefined") stopDragging();
  });

  function onHandleKeyDown(e: KeyboardEvent, type: HandleType) {
    if (disabled) return;
    const direction =
      e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? -1
        : e.key === "ArrowRight" || e.key === "ArrowUp"
          ? 1
          : 0;
    if (!direction) return;

    e.preventDefault();
    const delta = direction * effectiveStep * (e.shiftKey ? 10 : 1);
    if (type === "min") {
      min = snap(clamp(effMin + delta, dataDomain[0], effMax));
    } else {
      max = snap(clamp(effMax + delta, effMin, dataDomain[1]));
    }
  }
</script>

<div class="distribution-container" class:disabled style="touch-action: none">
  <div class="chart-wrapper" bind:this={container} style:height="{height}px">
    {#if finiteValues.length > 0}
      <LayerCake
        data={binnedData}
        x={(d: Bin) => [d.x0, d.x1]}
        y={(d: Bin) => d.length}
        xScale={scaleLinear()}
        yScale={scale === "sqrt" ? scaleSqrt() : scaleLinear()}
        padding={PADDING}
      >
        {#snippet children({
          data: cakeData,
          xScale,
          yScale,
          height: chartHeight,
        }: CakeProps)}
          <Svg>
            <g class="bars">
              {#each cakeData as d (d.x0)}
                <rect
                  x={xScale(d.x0)}
                  y={chartHeight - getHeight(d, yScale, chartHeight)}
                  width={getWidth(d, xScale)}
                  height={getHeight(d, yScale, chartHeight)}
                  fill={barColor(d)}
                  fill-opacity={barOpacity}
                />
              {/each}
            </g>

            {@const x1 = xScale(effMin)}
            {@const x2 = xScale(effMax)}
            <rect
              x={Math.min(x1, x2)}
              y="0"
              width={Math.abs(x2 - x1)}
              height={chartHeight}
              fill="var(--builder-color-primary, #0070c9)"
              fill-opacity="0.1"
            />

            {#each [{ type: "min", x: x1, label: minLabel, now: effMin, lo: dataDomain[0], hi: effMax }, { type: "max", x: x2, label: maxLabel, now: effMax, lo: effMin, hi: dataDomain[1] }] as h (h.type)}
              <g
                class="handle-group"
                class:active={dragging === h.type}
                role="slider"
                tabindex={disabled ? -1 : 0}
                aria-label={`${h.label} value`}
                aria-disabled={disabled}
                aria-valuenow={h.now}
                aria-valuemin={h.lo}
                aria-valuemax={h.hi}
                aria-valuetext={formatValue(h.now)}
                onpointerdown={(e) =>
                  startDragging(e, h.type as HandleType, xScale)}
                onkeydown={(e) => onHandleKeyDown(e, h.type as HandleType)}
              >
                <title>{h.label}: {formatValue(h.now)}</title>
                <line
                  x1={h.x}
                  y1="0"
                  x2={h.x}
                  y2={chartHeight}
                  class="handle-line"
                />
                <line
                  x1={h.x}
                  y1="0"
                  x2={h.x}
                  y2={chartHeight}
                  class="hit-area"
                />
              </g>
            {/each}
          </Svg>
        {/snippet}
      </LayerCake>
    {:else}
      <div class="no-data">No numeric data to display</div>
    {/if}
  </div>

  {#if showInputs}
    <div class="inputs">
      <div class="input-group">
        <label for="{uid}-min">{minLabel}</label>
        <input
          id="{uid}-min"
          type="number"
          bind:value={min}
          step="any"
          {disabled}
        />
      </div>
      <div class="input-group">
        <label for="{uid}-max">{maxLabel}</label>
        <input
          id="{uid}-max"
          type="number"
          bind:value={max}
          step="any"
          {disabled}
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .distribution-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-block: 0.5rem;
    width: 100%;
  }
  .distribution-container.disabled {
    opacity: 0.6;
  }
  .chart-wrapper {
    width: 100%;
    border-radius: 4px;
    border: 1px solid var(--border, rgba(122, 123, 135, 0.5));
    overflow: hidden;
    padding-bottom: 5px;
    box-sizing: border-box;
  }
  .no-data {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .handle-group {
    cursor: col-resize;
    outline: none;
  }
  .disabled .handle-group {
    cursor: not-allowed;
  }
  .handle-line {
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-dasharray: 2, 2;
    transition:
      stroke-width 0.2s,
      stroke-dasharray 0.2s;
  }
  .hit-area {
    stroke: transparent;
    stroke-width: 16;
  }
  .handle-group:hover .handle-line,
  .handle-group:focus-visible .handle-line,
  .handle-group.active .handle-line {
    stroke-width: 2.5;
    stroke-dasharray: none;
  }
  .inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .input-group {
    display: flex;
    flex-direction: column;
  }
  .input-group label {
    margin-bottom: 2px;
  }
  .input-group input {
    width: 100%;
  }
</style>
