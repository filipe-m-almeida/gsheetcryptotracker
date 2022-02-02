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

  let header = output.shift();
  output = output
      .sort((a, b) => parseInt(a[2]) - parseInt(b[2])) // Sort transactions in descending order.
      .map(x => filterRow( x, address) );              // Apply column filter 
  return [header , ...output];
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

const noFilter = (x : string) => x;
const dateFilter = (x : string) => { return new Date(parseInt(x) * 1000).toString() };
const aliasFilter = (x : string) => {
  return alias.has(x) ? `${alias.get(x)} (${x})` : x;
}

// TODO(filipe): Add a filter to linkify blocks, transactions and addresses. Unclear if this can be done as a function though.
const filters = [
  noFilter,     // Network
  noFilter,    // Blocknumber
  dateFilter,  // Date
  noFilter,    // hash
  noFilter,    // Nonce
  noFilter,    // Blockhash
  aliasFilter, // From
  aliasFilter, // Contact Address
  aliasFilter  // To
]


function filterRow(row: string[], address : string) : string[] {
  for(let i = 0; i < filters.length; i++) {
    row[i] = filters[i](row[i]);
  }

  return row;
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
