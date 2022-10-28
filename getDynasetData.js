const BTC_ABI = require("./dynaset_BTC_ABI.json");
const ETH_ABI = require("./dynaset_ETH_ABI.json");
const TelegramBot = require('node-telegram-bot-api');

const USDT_ABI = require("./usdt_abi.json"); // AJOUT

const Web3 = require("web3");
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token,{polling : true});

const RPC_URL = `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`;
// to preload env varables use this command : node -r dotenv/config getDynsasetData.js (if bug when running node getDynasetData.js directly)

const init = async() => {
    bot.sendMessage("-1001772396973","Bot connected");
    const web3 = new Web3(RPC_URL);

    const BTC_DYN_ADDRESS = "0xDa49AF8773Cb162ca56f8431442c750896F8C87A"; // 2 D A ADDRESS
    const ETH_DYN_ADDRESS = "0x7bb1A6b19e37028B3aA5c580339c640720E35203";
    //const DYDX_DYN_ADRESS = "0x976a95786DA6f6eE1c0755cCFB9A22adac2BF7B2";

    const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // AJOUT
    const usdt_contract = new web3.eth.Contract(USDT_ABI,USDT_ADDRESS); // AJOUT
    
    const dyn_btc_contract = new web3.eth.Contract(BTC_ABI,BTC_DYN_ADDRESS);
    const dyn_eth_contract = new web3.eth.Contract(ETH_ABI,ETH_DYN_ADDRESS);

    let options = {
        filter : {
        },
        fromBlock: 0,
    };

    // console.log(await dyn_btc_contract.methods.getTokenAmounts().call())

    // const results = await dyn_btc_contract.getPastEvents(
    //     'Swap',
    //     options,
    // );
    // console.log(results);


    async function blockToDate(blockNumber) {
        let dateRaw = await web3.eth.getBlock(blockNumber);
        let date = new Date(dateRaw.timestamp*1000)
        return date.toUTCString();
    }

    function formatAddressToToken(addressOfToken, amount) {
        if (addressOfToken === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48") { // usdc ++ mettre bon nbre decimales (6)
            
        }
        else if (addressOfToken === "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"){//wbtc (8 decimales)

        } 
        else if (addressOfToken === "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") { //weth (18 decimales)

        }
        else { // on laisse l'addresse comme elle est a la base / on prend 18 décimales

        }
        
    }

    // dyn_btc_contract.events.Swap(options)
    //     .on('data',async event => {
    //         let tokenIn = JSON.stringify(event.returnValues.tokenIn); // A VOIR NOMBRE DE DECIMALES POUR CONVERSION (wbtc et usdc weth decimales differentes ==> faire fonction)
    //         let tokenOut = JSON.stringify(event.returnValues.tokenOut);
    //         let amountIn = JSON.stringify(event.returnValues.amountIn);
    //         let amountOutMin = JSON.stringify(event.returnValues.amountOutMin);
    //         let time = await blockToDate(event.blockNumber);
                    //envoyer tokenIn + amountIn && tokenOut + amountOutMin dans fonction format... puis reformater le console.log et mettre dans variable pour afficher
    //         console.log(`Swap effectué entre ${tokenIn} et ${tokenOut}, d'un montant de ${amountIn}${tokenIn} pour un minimum reçu de ${amountOutMin}${tokenOut} à ${time}`);
    //     }
    // );
    
    
    usdt_contract.events.Transfer(options)
        .on('connected',str => console.log(str))
        .on('data', async event => {
            let from = JSON.stringify(event.returnValues.from);
            let to = JSON.stringify(event.returnValues.to);
            let value = JSON.stringify(event.returnValues.value/1000000);
            let time = await blockToDate(event.blockNumber);
            let text = `transfert USDT from ${from} to ${to} d'une valeur de ${value} USDT à ${time}`;
            console.log(text);
            // console.log(event);
            bot.sendMessage("-1001772396973",text);
        }
    );
 
};
init();
