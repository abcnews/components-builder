<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MarkerAdmin from "./MarkerAdmin.svelte";
  import BuilderStyleRoot from "$lib/BuilderStyleRoot/BuilderStyleRoot.svelte";

  const { Story } = defineMeta({
    title: "Components/MarkerAdmin",
    component: MarkerAdmin,
    tags: ["autodocs"],
    decorators: [() => BuilderStyleRoot],
    argTypes: {
      projectName: { control: "text" },
    },
    args: {
      projectName: "storybook-test",
      prefixes: {
        "Scrolly mark": "#mark",
        "Scrolly opener": "#scrollytellerNAMEscrolly1",
        "Standalone graphic": "#graphic",
      },
      defaultMarkerName: () => "My New Marker",
    },
  });
</script>

<Story name="Primary" />

<Story
  name="Custom Prefixes"
  args={{
    prefixes: {
      "Custom Prefix": "#custom",
      "Another One": "#another",
    },
  }}
/>
