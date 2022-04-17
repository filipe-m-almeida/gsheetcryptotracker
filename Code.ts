declare function ImportJSON(url: string, query: string, parseOptions: string) : Array<Array<string>>;

let config = {};
let alias;

/**
 * Convert the configuration from the tab Config into a dictionary of lists of configs.
 * 
 */
// TODO(filipe): This function could use a serious cleanup.
// TODO(filipe): Create a type networks object
function refreshConfig(): void {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Config");
  var data = sheet.getDataRange().getValues();
  data.forEach(function (row) {

    if (!(row[0] in config)) {
      config[row[0]] = {};
    }
    config[row[0]][row[1]] = row.slice(2, 10);
  });

  alias = new Map();
  for(var address of Object.keys(config['alias'])) {
    alias.set((config['alias'][address][0]).toLowerCase(), address);
  }
}

/**
 * Returns a table with all the ERC20 transactions for a particular address.
 * 
 * @param address Blockchain address to query
 * @returns 
 */
function TransactionsERC20(address : string) {

  // Return if no address, so TransactionsERC20("") can be used as a template
  if (address == "") {
    return "[Action Required] Add an address to this cell's function.";
  }

  refreshConfig();

  var output: Array<Array<string>> = [];
  let index: number = 0;

  for (let network of Object.keys(config['network'])) {
    output = [...output, ...importNetworkTransactions(address, network, index)];
    index++;
  }

  let header = renameHeaders(output.shift());

  output = output
      .sort((a, b) => rowOrder(a, b, Field.TimeStamp)) // Sort transactions in descending order.
      .map(x => filterRow( x, address) );              // Apply column filter 
  return [header , ...output].map(filterOutputFields);
}

function importNetworkTransactions(address : string, network : string, index : number) {
  var [api, key] = config['network'][network];

  // TODO(filipe): Maybe use the defaultTransform_ argument of ImportJSONAdvanced(...) to implement filters.
  let url: string = `https://${api}/api?module=account&action=tokentx&address=${address}&sort=asc&apikey=${key}`;
  var input: Array<Array<string>> = ImportJSON(url, "/result", "allHeaders");
  var header: Array<string> = input.shift();
  var output: Array<Array<string>> = [];

  // TODO(filipe): Find a better way here. A little hacky in order to only output the header once.
  if (index == 0) {
    output.push(["Network", ...header]);
  }

  for (let e of input) {
    output.push([network, ...e]);
  }

  return output;
}

type FilterType = (value: string, index: number, row: string[]) => string

const dateFilter = (x : string) => { return new Date(parseInt(x) * 1000).toString() };
const aliasFilter = (x : string) => {
  return alias.has(x) ? `${alias.get(x)} (${x})` : x;
}
const valueFilter = (x: string, i: number, row: string[]) => String(Number(x) / Math.pow(10, Number(row[Field.TokenDecimal])))
const gasPriceFilter = (x: string, i: number, row: string[]) => String(Number(x) / Math.pow(10, GweiDecimals))

/**
 * Field index of all returns etherscan.io fields.
 */
enum Field {
  Network,
  BlockNumber,
  TimeStamp,
  Hash,
  Nonce,
  BlockHash,
  From,
  Contract,
  To,
  Value,
  TokenName,
  TokenSymbol,
  TokenDecimal,
  TransactionIndex,
  Gas,
  GasPrice,
  GasUsed,
  CumulativeGasUsed,
  Input,
  Confirmations
}

const OutputFields: number[] = [
  Field.Network,
  Field.BlockNumber,
  Field.TimeStamp,
  Field.Hash,
  Field.From,
  Field.Contract,
  Field.To,
  Field.Value,
  Field.TokenSymbol,
  Field.GasPrice,
  Field.GasUsed
]

const Filter = new Map<Field, FilterType>([
  [Field.TimeStamp, dateFilter],
  [Field.From, aliasFilter],
  [Field.Contract, aliasFilter],
  [Field.To, aliasFilter],
  [Field.Value, valueFilter],
  [Field.GasPrice, gasPriceFilter]
]);

const HeaderMap = new Map<string, string>([
  ["Blocknumber", "Block"],
  ["Contractaddress", "Contract"],
  ["Tokensymbol", "Token"],
  ["Gasprice", "Gas Price"],
  ["Gasused", "Gas"]
]);

const GweiDecimals : number = 9;

// TODO(filipe): Should move to processing the etherscan.io json instead of the ImportJSON processed table.
function filterRow(row: string[], address : string) : string[] {
  return row.map((value, index, row) => {
    return Filter.has(index)
      ? Filter.get(index)(value, index, row)
      : value;
  });
}

/**
 * Return a a row with only the ordered fields present in {@link OutputFields}
 * 
 * @param row input row
 * @returns filtered and ordered row
 */
function filterOutputFields(row: string[]) : string[] {
  let result = [];
  for(let col of OutputFields) {
    result.push(row[col]);
  }
  return result;
}

function renameHeaders(headers: string[]) {
  return headers.map(h => {
    return HeaderMap.has(h)
      ? HeaderMap.get(h)
      : h;
  });
}

/**
 * Order function between two array.
 * 
 * Returns the numeric order between to arrays. This function is meant to be used with array.sort().
 * 
 * @param a first array
 * @param b  second array
 * @param field field to be used in ordered
 */
function rowOrder(a: string[], b: string[], field: Field) {
  return parseInt(a[field]) - parseInt(b[field]);
}

function onTimer() {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Config");
  var data = sheet.getDataRange();

  for (let i = 1; i < data.getLastRow(); i++) {
    let key1 = data.getCell(i, 1).getValue();
    let key2 = data.getCell(i, 2).getValue();
    if (key1 == "checkpoint" && key2 == "time") {
      let cell = data.getCell(i,3).setValue(Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd HH:mm:ss"));
    }
  }
}
