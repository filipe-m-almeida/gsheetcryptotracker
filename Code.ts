declare function ImportJSON(url: string, query: string, parseOptions: string) : Array<Array<string>>;

let config = {};
let alias = {};

/**
 * Convert the configuration from the tab Config into a dictionary of lists of configs.
 * 
 */
function refreshConfig(): void {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Config");
  var data = sheet.getDataRange().getValues();
  data.forEach(function (row) {

    if (!(row[0] in config)) {
      config[row[0]] = {};
    }
    config[row[0]][row[1]] = row.slice(2,10);
    Logger.log(row[0] + "," + row[1] + ", " + row[2]);
  });


  for(var address of Object.keys(config['alias'])) {
    Logger.log(address + ", " + config['alias'][address][0]);
    alias[config['alias'][address][0]] = address;
  }
}

/**
 * Returns a table with all the ERC20 transactions for a particular address.
 * 
 * @param address Blockchain address to query
 * @returns 
 */
function TransactionsERC20(address : string) {
  refreshConfig();

  var output: Array<Array<string>> = [];
  let index: number = 0;

  for (let network of Object.keys(config['network'])) {
    output = [...output, ...importNetworkTransactions(address, network, index)];
    index++;
  }

  return output;
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

  // TODO(filipe): Add column filters
  //   - Decode timestamps
  //   - Links for transactions
  //   - Addresses alias

  // Add network name to the first column
  for (var row of input) {
    let newRow = filterRow(row, network, address);
    output.push(newRow);
  }    

  return output;
}

const noFilter = (x) => x;
const dateFilter = (x : string) => { return new Date(parseInt(x) * 1000).toString() };

const filters = [
  noFilter,
  dateFilter,
  noFilter,
  noFilter,
  noFilter,
  aliasFilter,
  aliasFilter,
  aliasFilter
]


function filterRow(row: string[], network : string, address : string) {

  for(let i = 0; i < filters.length; i++) {
    row[i] = filters[i](row[i]);
  }

  return [network, ...row];
}

function aliasFilter(address : string) {
  if (address in alias) {
    let name = alias[address];
    address = `${name} (${address})`
  }
  return address;
}

