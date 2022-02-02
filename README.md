# [gsheetcryptotracker](https://docs.google.com/spreadsheets/d/1Nu8P490bvQqJdzAN5BoKuY3UySY-eqRuKybsaQvkTXY)

Implements a set of functions in Google Apps Script that import and sync blockchains transactions into Google Sheets.

Everyblock chain is supported as long as there is an etherscan API for it.

## Usage

* Make a copy of the following the [gsheetcryptotracker Template](https://docs.google.com/spreadsheets/d/1Nu8P490bvQqJdzAN5BoKuY3UySY-eqRuKybsaQvkTXY)
* Add API keys to the Config tab
* On the Transactions tab, add your blockchain address to the function in the first cell: `=ImportERC20(address, Config!C1)`
* Optionally
 * Add address aliases
 * Setup a timer that calls onTimer() so you have the transactions refreshed regularly.

## Requirements

* [Clasp](https://developers.google.com/apps-script/guides/clasp)

## Instalation

```bash
git clone https://github.com/filipe-m-almeida/gsheetcrypto.git
git submodule update --init
```

## Deployment

```bash
clasp login
clasp clone [script id]
clasp push
```

## Example Config tab settings
|            |                     |                     |           |
| ---------- | ------------------  |---------------------|---------- |
| checkpoint | time                |                     |           |
| network    | Ethereum            | api.etherscan.io    | [API KEY] |
| network    | Avalanche           | api.snowtrace.io    | [API KEY] |
| network    | Fantom              | api.ftmscan.com     | [API KEY] |
| network    | Binance Smart Chain | api.bscscan.com     | [API KEY] |
| network    | Polygon             | api.polygonscan.com | [API KEY] |
| alias      | My Account          | 0x1234              | .         |

# TODO
* Template spreadsheet
* One-click spreadsheet creation using Google Apps API
* Address, transaction and block links to etherscan.
* Api url endpoint defaults for the different supported networks.
* Alternating row colors clustering transaction ids.
* Highlight main account address cells in bold.
* *[Done]* Turn timestamps into readable date and time Google Sheets types.
* *[Done]* Support address alias that show up in the address and contract cells.

# Author
Filipe Almeida <filipe.almeida@gmail.com>
