const TelegramBot = require('node-telegram-bot-api');
const Web3 = require("web3");
const BTC_ABI = require("./dynaset_BTC_ABI.json");
const ETH_ABI = require("./dynaset_ETH_ABI.json");
// const USDT_ABI = require("./usdt_abi.json"); // AJOUT
require("dotenv").config(); // to preload env varables use this command : node -r dotenv/config getDynsasetData.js (if bug when running node getDynasetData.js directly)


const RPC_URL = `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`;
const token = process.env.TELEGRAM_BOT_TOKEN;

const BTC_DYN_ADDRESS = "0xDa49AF8773Cb162ca56f8431442c750896F8C87A"; // 2 D A ADDRESS
const ETH_DYN_ADDRESS = "0x7bb1A6b19e37028B3aA5c580339c640720E35203";
//const DYDX_DYN_ADRESS = "0x976a95786DA6f6eE1c0755cCFB9A22adac2BF7B2";
// const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // AJOUT

const bot = new TelegramBot(token,{polling : true});
const web3 = new Web3(RPC_URL);    

const init = async() => {
    
    const dyn_btc_contract = new web3.eth.Contract(BTC_ABI,BTC_DYN_ADDRESS);
    const dyn_eth_contract = new web3.eth.Contract(ETH_ABI,ETH_DYN_ADDRESS);
    // const usdt_contract = new web3.eth.Contract(USDT_ABI,USDT_ADDRESS); // AJOUT
    
    const options = {
        filter : {
        },
        fromBlock: 0,
    };

    bot.sendMessage("-1001772396973","Bot connected");    

    async function blockToDate(blockNumber) {
        const dateRaw = await web3.eth.getBlock(blockNumber);
        const date = new Date(dateRaw.timestamp*1000)
        return date.toUTCString();
    }

    async function getDynaData(dyna) {
        dyna.events.Swap(options)
        .on('data',async event => {
            let tokenIn = JSON.stringify(event.returnValues.tokenIn); // A VOIR NOMBRE DE DECIMALES POUR CONVERSION (wbtc et usdc weth decimales differentes ==> faire fonction)
            let tokenOut = JSON.stringify(event.returnValues.tokenOut);
            let amountIn = JSON.stringify(event.returnValues.amountIn);
            let amountOutMin = JSON.stringify(event.returnValues.amountOutMin);
            let time = await blockToDate(event.blockNumber);
            // indiquer de quel dynaset ca provient (dyna btc ou dyna eth)
            // envoyer tokenIn + amountIn && tokenOut + amountOutMin dans fonction format... puis reformater le console.log et mettre dans variable pour afficher ++ afficher solde total avec getTotalAmount
            console.log(`From Dyno BTC : Swap between ${tokenIn} and ${tokenOut}, for ${amountIn} ${tokenIn} and will receive a minimum of ${amountOutMin} ${tokenOut} at ${time}`);
        } );        
    }

    getDynaData(dyn_btc_contract);
    getDynaData(dyn_eth_contract);

};

init();

// console.log(await dyn_btc_contract.methods.getTokenAmounts().call())

    // const results = await dyn_btc_contract.getPastEvents(
    //     'Swap',
    //     options,
    // );
    // console.log(results);


  
    // function formatAddressToToken(addressOfToken, amount) { // A VOIR POUR FAIRE FONCTION QUI RECUPERE DIRECTEMENT NOM DU TOKEN ET DECIMALES PLUTOT QUE HARDCODER CA
    //     if (addressOfToken === USDC_INFO[0] ) { // usdc ++ mettre bon nbre decimales (6)
    //         let token_name = "USDC";
    //         let token_amount = amount / 10**USDC_INFO[1];
    //     }
    //     else if (addressOfToken === WBTC_INFO[0]){//wbtc (8 decimales)
    //         let token_name = "WBTC";
    //         let token_amount = amount / 10**USDC_INFO[1];
    //     } 
    //     else if (addressOfToken === WETH_INFO[0]) { //weth (18 decimales)
    //         let token_name = "WETH";
    //         let token_amount = amount / 10**USDC_INFO[1];
    //     }
    //     else { // on laisse l'addresse comme elle est a la base / on prend 18 décimales
    //         let token_name = "ETH";
    //         let token_amount = amount / 10**18;
    //     }
    //     return token_name, token_amount;
        
    // }


    // usdt_contract.events.Transfer(options)
    //     .on('connected',str => console.log(str))
    //     .on('data', async event => {
    //         let from = JSON.stringify(event.returnValues.from);
    //         let to = JSON.stringify(event.returnValues.to);
    //         let value = JSON.stringify(event.returnValues.value/1000000);
    //         let time = await blockToDate(event.blockNumber);
    //         let text = `transfert USDT from ${from} to ${to} d'une valeur de ${value} USDT à ${time}`;
    //         console.log(text);
    //         // console.log(event);
    //         bot.sendMessage("-1001772396973",text);
    //     }
    // );

    
    // dyn_btc_contract.events.Swap(options)
    //     .on('data',async event => {
    //         let tokenIn = JSON.stringify(event.returnValues.tokenIn); // A VOIR NOMBRE DE DECIMALES POUR CONVERSION (wbtc et usdc weth decimales differentes ==> faire fonction)
    //         let tokenOut = JSON.stringify(event.returnValues.tokenOut);
    //         let amountIn = JSON.stringify(event.returnValues.amountIn);
    //         let amountOutMin = JSON.stringify(event.returnValues.amountOutMin);
    //         let time = await blockToDate(event.blockNumber);
    //         // indiquer de quel dynaset ca provient (dyna btc ou dyna eth)
    //         // envoyer tokenIn + amountIn && tokenOut + amountOutMin dans fonction format... puis reformater le console.log et mettre dans variable pour afficher ++ afficher solde total avec getTotalAmount
    //         console.log(`From Dyno BTC : Swap between ${tokenIn} and ${tokenOut}, for ${amountIn} ${tokenIn} and will receive a minimum of ${amountOutMin} ${tokenOut} at ${time}`);
    //     }
    // );

    //        // a factoriser :

    //        dyn_eth_contract.events.Swap(options)
    //        .on('data',async event => {
    //            let tokenIn = JSON.stringify(event.returnValues.tokenIn); // A VOIR NOMBRE DE DECIMALES POUR CONVERSION (wbtc et usdc weth decimales differentes ==> faire fonction)
    //            let tokenOut = JSON.stringify(event.returnValues.tokenOut);
    //            let amountIn = JSON.stringify(event.returnValues.amountIn);
    //            let amountOutMin = JSON.stringify(event.returnValues.amountOutMin);
    //            let time = await blockToDate(event.blockNumber);
    //                   // envoyer tokenIn + amountIn && tokenOut + amountOutMin dans fonction format... puis reformater le console.log et mettre dans variable pour afficher ++ afficher solde total avec getTotalAmount
    //            console.log(`From Dyno ETH : Swap between ${tokenIn} and ${tokenOut}, for ${amountIn} ${tokenIn} and will receive a minimum of ${amountOutMin} ${tokenOut} at ${time}`);
    //        }
    //    ); 
