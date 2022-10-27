const BTC_ABI = require("./dynaset_BTC_ABI.json");
const ETH_ABI = require("./dynaset_ETH_ABI.json");
const Web3 = require("web3");
require("dotenv").config();
const RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.INFURA_ID}`;
// to preload env varables use this command : node -r dotenv/config getDynsasetData.js (if bug when running node getDynasetData.js directly)

const init = async() => {
    const web3 = new Web3(RPC_URL);

    const BTC_DYN_ADRESS = "0xDa49AF8773Cb162ca56f8431442c750896F8C87A";
    const ETH_DYN_ADRESS = "0x7bb1A6b19e37028B3aA5c580339c640720E35203";
    //const DYDX_DYN_ADRESS = "0x976a95786DA6f6eE1c0755cCFB9A22adac2BF7B2";
    
    const dyn_btc_contract = new web3.eth.Contract(BTC_ABI,BTC_DYN_ADRESS);
    const dyn_eth_contract = new web3.eth.Contract(ETH_ABI,ETH_DYN_ADRESS);
    
    // console.log(await dyn_btc_contract.methods.getTokenAmounts().call())

    const results = await dyn_btc_contract.getPastEvents(
        'Swap',
        {
        fromBlock :  15833562,
        toBlock :  15833577
    }
    );
    console.log(await results);
};
init();
