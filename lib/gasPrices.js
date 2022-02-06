/*
Get gas prices from 3rd party providers.
This is non-optimised - could cache stuff instead of requesting every time. 
This is also the market price now rather than what it will be at the time of the transaction 
TODO:
- could give a spread
- 
*/

import fetch from 'node-fetch'; // can get rid later
import ethers from 'ethers';
import { URL, URLSearchParams } from 'url';

import dotenv from 'dotenv';
dotenv.config();

// estimated gas required for different operations
const GAS_COST = {
    // gas price for transferring money
    transfer: '21000',
}

// generate requests
const request = ( url, headers = {}, params = {}, method = 'GET' ) => {
    let options = {
        method,
        headers
    };
    if ( 'GET' === method ) {
        url += '?' + ( new URLSearchParams( params ) ).toString();
    } else {
        options.body = JSON.stringify( params );
    }
    console.log(`Requesting ${url} with options ${JSON.stringify(options)}`);
    return fetch( url, options ).then( response => response.json() );
};
const get = ( url, headers, params ) => request( url, headers, params, 'GET' );
const post = ( url, headers, params ) => request( url, headers, params, 'POST' );

/*
Get current price of crypto currencies
*/
async function getCryptoPrices() {
    console.log(`Getting crypto prices from coinmarketcap.com`);
    const response = await get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', 
        {'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY},
        {symbol: "ETH,MATIC,SOL"});
    let prices = {}
    for (const [symbol, obj] of Object.entries(response.data)) {
        prices[symbol] = obj.quote.USD.price;
    }
    return prices;
}


/*
Returns the price per unit of gas required.
*/
function getEthGasPrices() {
    console.log(`Getting gas prices from ethgasstation.info`);
    return fetch('https://ethgasstation.info/json/ethgasAPI.json')
        .then(response => response.json())
        .then(json => {
            // prices giver in Gwei*10. 
            // Return value in ETH
            return {
                low: ethers.utils.formatEther(json.safeLow * 10**8),
                medium: ethers.utils.formatEther(json.average * 10**8),
                high: ethers.utils.formatEther(json.fast * 10**8)
            }
        }
    )
}


// function getPolygonGasPrices() {

/*
Get the estimated transaction cost given the type of transaction and the network.
Returns a dict of price in USD or the native currency of the network.
*/
async function getAverageGasCosts(txType, network) {
    switch (network) {
        case "eth":
            const gasPrice = await getEthGasPrices().then(gasPrices => {return gasPrices.medium});
            const ethPrice = await getCryptoPrices().then(prices => {return prices.ETH});
            const txCostEth = GAS_COST[txType] * gasPrice;
            return {"ETH": txCostEth, "USD": txCostEth * ethPrice};
        case "polygon":
            return 0;
        default:
            return 0;
    }
}

// test
getAverageGasCosts("transfer", "eth").then(transactionCost => {
    console.log(`\nprice for an ETH transfer ${transactionCost.ETH} ETH or ${transactionCost.USD} USD`);
})

// getCryptoPrices().then(prices => {
//     // console.log(`price for ETH: ${prices[1].quote.USD.price}`);
//     console.log(prices);
// })
