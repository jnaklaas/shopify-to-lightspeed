# shopify-to-lightspeed

Parse Shopify product CSV export data to Lightspeed import CSV data using nodejs. (Lightspeed = former SEOshop).

## execute scripts

### parse products
```
node parseProducts.js input.csv output.csv --delimiter=semicolon
```

1. `node`
2. `parseProducts.js`   the script that parses the products from Shopify format to Lightspeed format
3. `input.csv` the input script in Shopify format
3. `output.csv` the output script in Lightspeed format
5. `--delimiter=semicolon` optional delimiter, values: `[comma|semicolon]` defaults to `semicolon`.

### parse customers
```
node parseCustomers.js input.csv output.csv
```


## requirements

- nodejs: https://nodejs.org/

node modules: 

- csvtojson
- jsonexport
- fs
- progress
- minimist

install command: `npm install -S csvtojson jsonexport fs progress minimist` 