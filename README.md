# gsheetcrypto

Implements a set of functions in Google Apps Script that import and sync blockchains transactions into Google Sheets.

Everyblock chain is supported as long as there is an etherscan API for it.

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

## Usage

* Deploy the script to a Google Sheet you own
* Create a Config tab
 * Add the networks you want to support alongside your API keys
 * use `=ImportERC20(address)` in a cell. It will import all your transactions

## Optional
* Go to `Settings -> Calculation -> Recalculation` and change the update frequenecy to hourly or every minute.

## Example Config tab settings
|         |                    |                     |           |
| ------- | ------------------ |---------------------|---------- |
| network | Ethereum           | api.etherscan.io    | [API KEY] |
| network | Avalanche          | api.snowtrace.io    | [API KEY] |
| network | Fantom             | api.ftmscan.com     | [API KEY] |
| network | Binance Smart Scan | api.bscscan.com     | [API KEY] |
| network | Polygon            | api.polygonscan.com | [API KEY] |
| alias   | My Account         | 0x1234              | .         |

# TODO
* Template spreadsheet
* On-click spreadsheet creation using Google Apps API
* *[Done]* Turn timestamps into redable date and time Google Sheets types.
* *[Done]* Support address alias that show up in the address and contract cells.
* Address, transaction and block links to etherscan.
* Api url endpoint defaults for the different supported networks.
* Alternating row colors clustering transaction ids.
* Highlight main account address cells in bold.

# Author
Filipe Almeida <filipe.almeida@gmail.com>