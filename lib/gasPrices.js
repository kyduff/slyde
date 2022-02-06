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
    ethTransfer: 21000,
    erc20Transfer: 65000,   // also varies by token
    nftMint: 300000, // estimate (lower end 250k, upper end 350k dep on token)
    erc721Transfer: 300000,  // no idea
}

// generate requests. Returns json
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
    // console.log(`Requesting ${url} with options ${JSON.stringify(options)}`);
    return fetch( url, options ).then( response => response.json() );
};
const get = ( url, headers, params ) => request( url, headers, params, 'GET' );
const post = ( url, headers, params ) => request( url, headers, params, 'POST' );

/*
Get current price of crypto currencies
*/
export async function getCryptoPrices() {
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
export async function getEthGasPrices() {
    console.log(`Getting gas prices from ethgasstation.info`);
    const response = await get('https://ethgasstation.info/json/ethgasAPI.json', {}, {})
    // prices giver in Gwei*10. 
    // Return value in ETH
    return {
                low: ethers.utils.formatEther(response.safeLow * 10**8),
                medium: ethers.utils.formatEther(response.average * 10**8),
                high: ethers.utils.formatEther(response.fast * 10**8)
            };
}


export async function getPolygonGasPrices() {
    console.log(`Getting gas price from polygon scan`);
    const response = await get("https://api.polygonscan.com/api", 
        {},
        {module: "gastracker", action: "gasoracle", apikey: process.env.POLYGON_API_KEY}
    );
    return {
        low: ethers.utils.formatEther(parseInt(response.result.SafeGasPrice) * 10**9),
        medium: ethers.utils.formatEther(parseInt(response.result.ProposeGasPrice) * 10**9),
        high: ethers.utils.formatEther(parseInt(response.result.FastGasPrice) * 10**9)
    }
}
/*
Get the estimated transaction cost given the type of transaction and the network.
Returns a dict of price in USD or the native currency of the network.
*/
export async function getAverageGasCosts(txType, network) {
    let gasPrice;
    switch (network) {
        case "eth":
            gasPrice = await getEthGasPrices().then(gasPrices => {return gasPrices.medium});
            const ethPrice = await getCryptoPrices().then(prices => {return prices.ETH});
            const txCostEth = GAS_COST[txType] * gasPrice;
            return {"ETH": txCostEth, "USD": txCostEth * ethPrice};
        case "polygon":
            gasPrice = await getPolygonGasPrices().then(gasPrices => {return gasPrices.medium});
            const maticPrice = await getCryptoPrices().then(prices => {return prices.MATIC});
            const txCostMatic = GAS_COST[txType] * gasPrice;
            return {"MATIC": txCostMatic, "USD": txCostMatic * maticPrice};
        default:
            return 0;
    }
}

// testing 
// getAverageGasCosts("ethTransfer", "eth").then(transactionCost => {
//     console.log(`\nprice for an ETH transfer on eth mainnet is ${transactionCost.ETH} ETH or ${transactionCost.USD} USD`);
// })

// getAverageGasCosts("ethTransfer", "polygon").then(transactionCost => {
//     console.log(`\nprice for an ETH transfer on polygon is ${transactionCost.MATIC} MATIC or ${transactionCost.USD} USD`);
// });

// getCryptoPrices().then(prices => {
//     // console.log(`price for ETH: ${prices[1].quote.USD.price}`);
//     console.log(prices);
// })
