# Teller Widget

Welcome to the Teller Widget! This widget allows any dapp to integrate Teller's front end into their app and allow users to do cash advances with either the tokens in their wallets or a specified token list.

# Documentation
- [Getting started](https://docs.teller.org/teller-widget/getting-started)
- [API reference](https://docs.teller.org/teller-widget/api-reference)
- [Interactive sandbox](https://widget-storybook.teller.org/)

# Required packaages

```bash
 @tanstack/react-query
 alchemy-sdk
 graphql
 graphql-request
 react
 react-dom
 @teller-protocol/v2-contracts
```

# Installation

Install the widget (and required packages) by using npm or yarn

```bash
yarn add @teller-protocol/teller-widget @tanstack/react-query alchemy-sdk graphql graphql-request react react-dom @teller-protocol/v2-contracts
```

```bash
npm i --save @teller-protocol/teller-widget @tanstack/react-query alchemy-sdk graphql graphql-request react react-dom @teller-protocol/v2-contracts
```

# Usage

To use the widget, import the `TellerWidget` component. None of the props are required.

```jsx
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget />;
};
```

## Props

The widget works out of the box with no configuration. However, you can pass in the following props to customize the widget.

### `buttonLabel`

A `string` to replace the default `Cash Advance` button label.

```jsx
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget buttonLabel="Get a loan now!" />;
};
```

### `whitelistedTokens`
An object grouped by chainId, made up of a list of token addresses.
By default these tokens show on additionally to the ones in the user's wallet.

```jsx
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

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
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

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
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget buttonClassName="button-v2" />;
};
```

### `isButtonBare`

A `boolean` for additional styling control. This resets the buttons's style to the browser's default.

```jsx
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget buttonClassName="button-v2" isButtonBare />;
};
```

### `whitelistedChains`

An optional `array` to show desired chains. By default, the widget shows all chains.
Available chains:
* 1 (Ethereum),
* 137 (Polygon)
* 42161 (Arbitrum)
* 8453 (Base)

```jsx
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget whitelistedChains={[1,137]} />;
};

```

### `referralFee`

Referral fee %, in basis points. For example, 100 = 1%, max 500 = 5%. Note, referral fee on rollover loans is capped at 5% of the original loan repayment.

```jsx
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget referralFee={100} />;
};

```

### `referralAddress`

Recipient wallet address to receive referral fee.

```jsx
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget referralAddress={"0x..."} />;
};

```

### `welcomeScreenLogo`

Logo (as a URL) to be displayed on the widget's welcome screen. Image types include .png, .jpg, .jpeg, .svg.

```jsx
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget welcomeScreenLogo={"https://img-url.png"} />;
};

```

### `welcomeScreenTitle`

Bold, header text on the widget's welcome screen.

```jsx
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget welcomeScreenTitle={"DeFi's cash advance"} />;
};

```

### `welcomeScreenParagraph`

Body, paragraph text on the widget's welcome screen.

```jsx
import { Widget as TellerWidget } from "@teller-protocol/teller-widget";

const App = () => {
  return <TellerWidget welcomeScreenParagraph={"Time-based loans, up to thirty days, with no margin-call liquidations."} />;
};

```

# Development

## Testing

Run storybook by doing

```
yarn storybook
```
