const TelegramBot = require('node-telegram-bot-api');
const Web3 = require("web3");
const BTC_ABI = require("./dynaset_BTC_ABI.json");
const ETH_ABI = require("./dynaset_ETH_ABI.json");
require("dotenv").config();
const fetch = require('node-fetch'); // mandatory with nodeJS to work with fetch()

const RPC_URL = `wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`;
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token,{polling : true});
const web3 = new Web3(RPC_URL);  


const BTC_DYN_ADDRESS = "0xDa49AF8773Cb162ca56f8431442c750896F8C87A"; 
const ETH_DYN_ADDRESS = "0x7bb1A6b19e37028B3aA5c580339c640720E35203";
//const DYDX_DYN_ADRESS = "0x976a95786DA6f6eE1c0755cCFB9A22adac2BF7B2";

//[address, decimals]
const USDC_INFO = ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",6];
const WBTC_INFO = ["0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",8];
const WETH_INFO = ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",18];

const id_chat = "-1001772396973";
const urlWethPriceApi = "https://api.coingecko.com/api/v3/simple/price?ids=weth&vs_currencies=usd";
const urlBtcPriceApi = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

const init = async() => {

    let nameToken1;
    let nameToken2;
    let balanceToken1;
    let balanceToken2;
    let ratio1;
    let ratio2;
    let tvl;

    const dyn_btc_contract = new web3.eth.Contract(BTC_ABI,BTC_DYN_ADDRESS);
    const dyn_eth_contract = new web3.eth.Contract(ETH_ABI,ETH_DYN_ADDRESS);
    
    const options = {
        filter : {
        },
        fromBlock: 0,
    };
    
    function getName(addressOfToken) {
        if (addressOfToken === USDC_INFO[0] ){
            return 'USDC';
        }
        else if (addressOfToken === WBTC_INFO[0]){
            return 'WBTC';
        }
        else if (addressOfToken === WETH_INFO[0]){
            return 'WETH';
        }
        else{
            return `unknown token, at address : ${addressOfToken}`;
        }
    }

    async function getPrice(url) {
        let response = await fetch(url);
        return response.json();
    }

    async function convertToUsd(token){

        let balance10 = parseInt(token[1]);
        if (token[0] === 'WETH'){
            let ethPrice = await getPrice(urlWethPriceApi);
            ethPrice = ethPrice.weth.usd; 
            return balance10 * ethPrice;
        }
        else if (token[0] === 'WBTC'){
            let btcPrice = await getPrice(urlBtcPriceApi);
            btcPrice = btcPrice.bitcoin.usd;
            return balance10 * btcPrice;
        }
        else {
            return balance10;
        }
    }

    // async function calculRatio(token1,token2){
    //     const balanceToken10 = await convertToUsd(token1);
    //     const balanceToken20 = await convertToUsd(token2);
    //     const total = balanceToken10 + balanceToken20;
    //     const ratioToken1 = (balanceToken10 / total)*100;
    //     const ratioToken2 = (balanceToken20 / total)*100;
    //     return [ratioToken1.toFixed(2),ratioToken2.toFixed(2),total.toFixed(2)];
    // }    
    
    function formatDecimals(amount,token_name){ 
        amount = parseInt(amount);
        if (token_name === 'USDC'){
            return (amount / 10**USDC_INFO[1]).toFixed(2);
        }
        else if (token_name === 'WBTC'){
            return (amount / 10**WBTC_INFO[1]).toFixed(8);
        }
        else if (token_name === 'WETH'){
            return (amount / 10**WETH_INFO[1]).toFixed(8);
        }
        else {
            return `${amount}, decimals unknown`;
        }
    
    }
    
    async function blockToDate(blockNumber) {
        const dateRaw = await web3.eth.getBlock(blockNumber);
        const date = new Date(dateRaw.timestamp*1000);
        return date.toUTCString();
    }

    async function getBalancesContract(dyna){
        const balances = await dyna.methods.getTokenAmounts().call();
        const _nameToken1 = getName(balances[0][0]);
        const _nameToken2 = getName(balances[0][1]);
        const _balanceToken1 = formatDecimals(balances[1][0],_nameToken1);
        const _balanceToken2 = formatDecimals(balances[1][1],_nameToken2);

        const _token1 = [_nameToken1, _balanceToken1];
        const _token2 = [_nameToken2,_balanceToken2];
        const _UsdBalanceToken1 = await convertToUsd(_token1);
        const _UsdbalanceToken2 = await convertToUsd(_token2);
        const _tvl = _UsdBalanceToken1 + _UsdbalanceToken2;
        const _ratioToken1 = (_UsdBalanceToken1 / _tvl) * 100;
        const _ratioToken2 = (_UsdbalanceToken2 / _tvl) * 100;

        return [_nameToken1,_nameToken2,_balanceToken1,_balanceToken2, _tvl.toFixed(2), _ratioToken1.toFixed(2), _ratioToken2.toFixed(2)];
    }

    bot.sendMessage(id_chat,"Bot connected"); 

    async function getDynaData(dyna) { 
        dyna.events.Swap(options)
        .on('data',async event => {
            // console.log(event);
            const name = await dyna.methods.name().call();
            const tokenIn = getName(event.returnValues.tokenIn);
            const tokenOut = getName(event.returnValues.tokenOut);
            const amountIn = formatDecimals(event.returnValues.amountIn, tokenIn);
            const amountOutMin = formatDecimals(event.returnValues.amountOutMin, tokenOut);
            const time = await blockToDate(event.blockNumber);

            [nameToken1,nameToken2,balanceToken1,balanceToken2, tvl, ratio1, ratio2] = await getBalancesContract(dyna);
            
            const message = `🚨 🚨 New swap detected 🚨 🚨\n\n${name}:\nSwap ${amountIn} ${tokenIn} for\n${amountOutMin} ${tokenOut}\n\n${name} TVL : ${tvl} $\nAssets:\n  ${balanceToken1} ${nameToken1} (${ratio1}%)\n  ${balanceToken2} ${nameToken2} (${ratio2}%)\n\n${time}`;
            console.log(message);
            bot.sendMessage(id_chat, message);

        } );
    }

    bot.on('message', (msg) => {
        var Hi = "???";
        if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
        bot.sendMessage(msg.chat.id,"I am stil here !");
        }
        });
   
    getDynaData(dyn_btc_contract);
    getDynaData(dyn_eth_contract);

    // voir pour recup de API de 1inch && uniswap pour prix du token au moment du swap ? + essayer d'avoir le montant exact swap plutot que le minAmountIn (avec database et balance token avant / apres le swap ou alors avec une API ou quelque chose ??)
    //web3.eth.getTransaction("0xaa4d6b0f95698146051f04bd7d2ed94cdbc725e445edb3726db56379a4b87144").then(console.log); 
};

init();
