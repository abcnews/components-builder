# components-builder

A set of common styles and components for creating builders - tools to configure and preview visualisations with a GUI interface.

**These components are not thoroughly tested as a library, and are provided as-is. Please contribute pull requests to
fix issues**

## Components

### Global Styles (BuilderStyleRoot)

This project uses global styles in the same way as bootstrap or tailwind. These styles mainly focus on form elements and things you'll likely to hit in a builder.

Wrap your application inside of the BuilderStyleRoot component to make use of these styles. Note that all the components in this repository also depend on these styles.

### BuilderFrame

A two column frame you can use to scaffold your builder.

```svelte
<script lang="ts">
  import { BuilderStyleRoot, BuilderFrame } from '@abcnews/components-builder';
</script>

{#snippet Viz()}
  <svg …>
{/snippet}

{#snippet Sidebar()}
  <fieldset>
    <legend>My builder</legend>
  </fieldset>
{/snippet}

<BuilderStyleRoot>
  <BuilderFrame {Viz} {Sidebar} />
</BuilderStyleRoot>

```

### UpdateChecker

The update checker extracts the current version number from the URL, and recursively checks for new versions, major, minor, and patch. If a new version is found it will show a modal prompting the user to update.

Please ensure all your application state is kept in the URL, otherwise it may be lost on upgrade.

Please take care when releasing your projects. If the deploy fails and you skip a version this component will get stuck at that point. You must either rewrite your git history to delete and redeploy the missing version, or add an empty index.html on contentftp to trick the updater into skipping it.

To tnclude the update checker, use the following code with optional button text:

```svelte
<UpdateChecker buttonText="Open new builder" />
```

### ScreenshotTool (fallback images)

The screenshot tool allows users to paste an entire article, then extracts all the markers and sends them to a third-party service to screenshot.

For this to work you must set up a standalone page that can display the visualisation that the external service to screenshot, similar to how you would develop an iframe version of the visualisation.

Note that the screenshot tool is not fast. We haven't been able to speed up the server side enough to make this a great experience.

```svelte
<ScreenshotTool
  defaultMarkerName={() => "My marker"}
  prefixes={{
    "Scrolly mark": "#mark",
    "Scrolly opener": "#scrollytellerNAMEelectionmap1",
    "Inline graphic": "#graphicinline",
  }}
  iframeUrl={window.location.origin +
    window.location.pathname.replace("/builder/", "/iframe/")}
/>
```

The `defaultMarkerName` Function provides a user-friendly version of the marker for the preview step. This is the same function as the `MarkerAdmin` component.

Prefixes correlate to the different marker types that have been implemented in the app. This is the same object as the `MarkerAdmin` component.

The iframe URL is the location that the screenshot tool hits to create screenshots. The screenshot tool will pass this iframe config via the hash, e.g. /iframe/#MARKER.

### Typeahead

The typeahead component uses a native HTML input element, in conjunction with the datalist element, to provide native searching and keyboard accessibility. The component implements its own multi-select functionality as that isn't available natively.

```svelte
<Typeahead
  {disabled}
  values={[{value: 'bne', label: 'Brisbane'},{value: 'syd', label: 'Sydney'}]}
  value={['bne']}
  onChange={newValue => console.log(newValue)}
```

### ContextMenu

The context menu component uses a native dialog element and provides a number of classes for you to style the contents of your menu. Check the storybook for more examples of these.

You can specify coordinates for the menu to appear, and you can usually find these on the click event when you click an element.

The context menu is designed for you to manually handle the isOpen state in your application.

```svelte
<ContextMenu>
  <div class="section" style="white-space:pre-wrap;">
    <strong>Brisbane</strong>
    <small>BNE</small>
  </div>
  <hr />
  <div class="section">Some notes about this seat</div>
  <hr />

  <label class="item">
    <div class="section">
      <input type="checkbox" /> An option
    </div>
  </label>

  <hr />

  <ul class="menu">
    <li><button class="item">Item 1</button></li>
    <li><button class="item">Item 2</button></li>
  </ul>

  <hr />

  <ul class="menu menu--double">
    <li><button class="item">Item 1</button></li>
    <li><button class="item">Item 2</button></li>
  </ul>
</ContextMenu>
```

### Modal

The modal component is useful for building more complex tools inside a builder.

You can provide your own footer elements to make either an okay/cancel alert, or next/next/done wizard style dialogue.

This uses the native dialogue element, so focus will always be inside the modal. Take care not to show more than one at a time.

Use the `position` prop to control where the modal appears:

- `centre` (default): Centred in the screen with a full dark backdrop.
- `right`: Aligned to the right, with a gradient backdrop that leaves your viz visible. Especially useful when the modal changes the viz reactively, so you can see the results.

```svelte
{#snippet children()}
  Hello this is the modal content
{/snippet}
{#snippet footerChildren()}
  <button onclick={() => (isOpen = false)}>Ok!</button>
{/snippet}

<Modal title="Example modal" {children} {footerChildren} position="right" />
```

### Google Doc Scrollyteller

This component lets edits draft stories in Google Docs and preview to scrollyteller in real time. This is useful because multiple people can be editing at once and have a real-time preview, whereas the CMS is single user and can be slow to iterate on.

This component must be set up on its own page, as it has two different routes built into it. An example implementation follows:

```svelte
<script>
  import {
    BuilderStyleRoot,
    GoogleDocScrollyteller,
  } from "@abcnews/components-builder";
  import { loadScrollyteller } from "@abcnews/svelte-scrollyteller";
  import MyScrollyteller from "../components/MyScrollyteller.svelte";
</script>

<BuilderStyleRoot>
  <GoogleDocScrollyteller
    name="electionmap"
    {loadScrollyteller}
    ScrollytellerRoot={MyScrollyteller}
  />
</BuilderStyleRoot>
```

You must pass in the loadScrollyteller function, as well as your component that implements svelte-scrollyteller. When the Google doc is loaded, your component will be mounted with the relevant markup in-page.

### MarkerAdmin

This is a component that streamlines how you handle markers. It includes a copy and paste function as well as the ability to save and load markers from localstorage.

As a prerequisite your builder must store its state in window.location.hash. E.g. `/builder/#marker`.

```svelte
<MarkerAdmin
  projectName="elections-federal2025-lower-house"
  prefixes={{
    "Scrolly mark": "#mark",
    "Scrolly opener": "#scrollytellerNAMEelectionmap1",
    "Inline graphic": "#graphicinline",
  }}
  defaultMarkerName={() => "My marker"}
/>
```

`defaultMarkerName` is a function that returns a user friendly name for the marker when the user clicks the save button. You can use this to customise default marker names based on the current hash, which can be useful if you have several different visualisations with distinct names.

Prefixes correlate to the different marker types that have been implemented in the app. Users can choose which type of marker they want to copy. This is the same object as the `ScreenshotTool` component.

### Loader

A fairly straightforward spinner with the text "Loading" underneath. Use it when the user needs to wait for a process to complete. You can adjust the size or text:

```svelte
<Loader width="32px" />
<Loader>Reticulating splines</Loader>
```

### ItemCollection

A component to help with building editor interfaces for collections of arbitrary objects. For example, a builder tool
might need to allow the creation of a list of annotations to appear on a chart.

This component expects to be working with some kind of global state object and uses [bound
properties](https://svelte.dev/docs/svelte/bind) to propagate changes back to the items managed by the collection.

- `collection` is an array of otherwise arbitrary objects that implement the `DeletableType` interface. They must be of
  uniform type.
- `current` is the item from the list currently being edited (or `undefined` if there is no item being edited). It should
  exist in the `collection`.
- `template` is an object of the same type as the items in the collection which provides defalut values for any new
  items added to the collection.
- `itemLabelGetter` is a function which takes an item of the same type as the items in the collection and returns a
  label to use for that item when it is displayed in the list.

An `EditForm` snippet is required and should render an edit form appropriate for the objects in the collection. The
edit form will be rendered in place of the collection list when `current` is defined.

```svelte
<ItemCollection
  legend="Annotations"
  template={defaultAnnotation}
  bind:current={currentAnnotation}
  bind:collection={allAnnotations}
  itemLabelGetter={(annotation) => annotation.label}
>
  {#snippet EditForm()}
    <label for="annotation-text">Label</label>
    <input
      id="annotation-text"
      type="text"
      bind:value={currentAnnotation.label}
    />
    <FormActions bind:item={currentAnnotation} />
  {/snippet}
</ItemCollection>
```

This component also contains two additional components only useful when used in conjunction with `ItemCollection`:

- `ItemList` is used to display this list of items in the collection and provides the edit and delete buttons.
- `FormActions` can be used to easily add close and delete buttons to the bottom of the edit form. It takes the
  currently edited `item` as a bound property.

### ButtonGroup

A simple component to provide styles for grouped buttons.

```svelte
<ButtonGroup>
  <button>One</button>
  <button>Two</button>
  <button>Three</button>
</ButtonGroup>
```

## Developing

Once you've nstalled dependencies with `npm install`, start a development storybook:

```bash
npm run storybook
```

Everything inside `src/lib` is part of the library, everything inside `src/routes` can be used as a showcase or preview app.

## Building

To build the library:

```bash
npm run build
```

Then publish the new version with:

```bash
npm publish
```
