<script lang="ts" generics="Item extends DeletableType">
  import { Check, Trash } from "svelte-bootstrap-icons";
  import ButtonGroup from "../ButtonGroup/ButtonGroup.svelte";

  interface Props {
    item: Item | undefined;
  }

  let { item = $bindable() }: Props = $props();
</script>

<ButtonGroup>
  <button onclick={() => (item = undefined)}><Check /> Done</button>
  <button
    onclick={() => {
      if (item) item.deleted = Date.now();
      item = undefined;
    }}><Trash /> Delete</button
  >
</ButtonGroup>
