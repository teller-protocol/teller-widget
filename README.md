# Teller Widget

Welcome to the Teller Widget! This widget allows any dapp to integrate Teller's front end into their app and allow users to do cash advances with either the tokens in their wallets or a specified token list.

# Documentation
- [API Reference](#requirements)

# Requirements

- React 18.2.0 or higher

# Installation

Install the widget by using npm or yarn

```bash
yarn add @teller-protocol/teller-widget
```

```bash
npm i --save @teller-protocol/teller-widget
```

# Usage

To use the widget, import the `TellerWidget` component. None of the props are required.

```jsx
import TellerWidget from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget />;
};
```

## Props

The widget works out of the box with no configuration. However, you can pass in the following props to customize the widget.

### `buttonLabel`

A `string` to replace the default `Cash Advance` button label.

```jsx
import TellerWidget from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget buttonLabel="Get a loan now!" />;
};
```

### `whitelistedTokens`
An object grouped by chainId, made up of a list of token addresses.
By default these tokens show on additionally to the ones in the user's wallet.

```jsx
import TellerWidget from "@teller-protocol/teller-widget";

const whiteListedTokens = {
  [137]: [
    "0x61299774020da444af134c82fa83e3810b309991",
    "0x692ac1e363ae34b6b489148152b12e2785a3d8d6",
  ],
  [1]: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
};

const App = () => {
  return <TellerWidget whiteListedTokens={whiteListedTokens} />;
};
```

### `showOnlyWhitelistedTokens`

A `boolen` to only show the tokens defined in the `whitelistedTokens` prop.
Must be used together with the `whitelistedTokens` prop.

```jsx
import TellerWidget from "@teller-protocol/teller-widget";

const whiteListedTokens = {
  [137]: [
    "0x61299774020da444af134c82fa83e3810b309991",
    "0x692ac1e363ae34b6b489148152b12e2785a3d8d6",
  ],
  [1]: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
};

const App = () => {
  return <TellerWidget whiteListedTokens={whiteListedTokens} showOnlyWhitelistedTokens />;
};
```

### `buttonClassName`

A `string` to be passed to the main button for adding a css class. Use this for customizing the button to match your app's design.

```jsx
import TellerWidget from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget buttonClassName="button-v2" />;
};
```

### `isButtonBare`

A `boolean` for additional styling control. This resets the buttons's style to the browser's default.

```jsx
import TellerWidget from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget buttonClassName="button-v2" />;
};
```

# Development

## Testing

Run storybook by doing

```
yarn storybook
```
