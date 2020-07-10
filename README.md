# Buttercup Diagnostics
> Diagnostics CLI helper

Provides diagnostic tools for examining vaults. This may be used to debug basic vault issues and may be requested by Buttercup staff when working with reported issues.

## Using this library

To use this library, you must have [NodeJS installed](https://nodejs.org/en/download/). Once it's installed, make sure both `node --version` and `npm --version` work. Node should be 12 or above, npm 6 or above.

Install the diagnostic tool by running `npm install -g @buttercup/diag@latest`.

### Commands

Inspect a vault by running the following:

```shell
bcup-diag inspect ~/my/vault.bcup
```

Export a vault by running:

```shell
bcup-diag export ~/my/vault.bcup ~/export.csv
```
