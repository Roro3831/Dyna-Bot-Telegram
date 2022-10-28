const TelegramBot = require('node-telegram-bot-api');
const Web3 = require("web3");
const BTC_ABI = require("./dynaset_BTC_ABI.json");
const ETH_ABI = require("./dynaset_ETH_ABI.json");
require("dotenv").config();


const RPC_URL = `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`;
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token,{polling : true});
const web3 = new Web3(RPC_URL);  


const BTC_DYN_ADDRESS = "0xDa49AF8773Cb162ca56f8431442c750896F8C87A"; 
const ETH_DYN_ADDRESS = "0x7bb1A6b19e37028B3aA5c580339c640720E35203";
//const DYDX_DYN_ADRESS = "0x976a95786DA6f6eE1c0755cCFB9A22adac2BF7B2";

//[address, decimals]
const USDC_INFO = ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",6] ;
const WBTC_INFO = ["0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",8];
const WETH_INFO = ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",18];

const id_chat = "-1001772396973";

const init = async() => {
    
    const dyn_btc_contract = new web3.eth.Contract(BTC_ABI,BTC_DYN_ADDRESS);
    const dyn_eth_contract = new web3.eth.Contract(ETH_ABI,ETH_DYN_ADDRESS);
    
    const options = { //passer en let au cas ou
        filter : {
        },
        fromBlock: 0, // synchro avec dernier block ?
    };
    
    function getName(addressOfToken) {
        if (addressOfToken === USDC_INFO[0] ){
            return 'USDC'
        }
        else if (addressOfToken === WBTC_INFO[0]){
            return 'WBTC'
        }
        else if (addressOfToken === WETH_INFO[0]){
            return 'WETH'
        }
        else{
            return `unknown token, at address : ${addressOfToken}`
        }
    }
    
    function formatDecimals(amount,token_name){ // parse par 3 les amounts ++ pas aller trop loin après la virgule (pour weth)
        amount = parseInt(amount);
        if (token_name === 'USDC'){
            return (amount / 10**USDC_INFO[1]).toFixed(2);
        }
        if (token_name === 'WBTC'){
            return (amount / 10**WBTC_INFO[1]).toFixed(8);
        }
        if (token_name === 'WETH'){
            return (amount / 10**WETH_INFO[1]).toFixed(8);
        }
        else {
            return `${amount}, decimals unknown`
        }
    
    }
    
    async function blockToDate(blockNumber) {
        const dateRaw = await web3.eth.getBlock(blockNumber);
        const date = new Date(dateRaw.timestamp*1000)
        return date.toUTCString();
    }

    bot.sendMessage(id_chat,"Bot connected");     // rajouter commande du bot !tvl_eth !tvl_btc OU l'ajouter dans le message du bot

    async function getDynaData(dyna) { // faire proportion des assets dans dynasets (ie : USDC (70%) ETH (30%))
        dyna.events.Swap(options)
        .on('data',async event => {
            const name = await dyna.methods.name().call();
            const tokenIn = getName(event.returnValues.tokenIn);
            const tokenOut = getName(event.returnValues.tokenOut);
            const amountIn = formatDecimals(event.returnValues.amountIn, tokenIn);
            const amountOutMin = formatDecimals(event.returnValues.amountOutMin, tokenOut);
            const time = await blockToDate(event.blockNumber);
            const balances = await dyna.methods.getTokenAmounts().call()
            const nameToken1 = getName(balances[0][0]);
            const nameToken2 = getName(balances[0][1]);
            const balanceToken1 = formatDecimals(balances[1][0],nameToken1);
            const balanceToken2 = formatDecimals(balances[1][1],nameToken2);
            console.log(balances[0][0],balances[1][0]);
            //  afficher solde total avec getTotalAmount
            const message = `🚨 🚨 New swap detected 🚨 🚨\n\n${name}:\nSwap ${amountIn} ${tokenIn} for\n${amountOutMin} ${tokenOut}\n\n${name} assets:\n  ${balanceToken1} ${nameToken1}\n  ${balanceToken2} ${nameToken2}\n\n${time}`;
            console.log(message);
            bot.sendMessage(id_chat, message);
        } );
    }
   
//    console.log(await dyn_btc_contract.methods.getTokenAmounts().call())


    getDynaData(dyn_btc_contract);
    getDynaData(dyn_eth_contract);

};

init();
