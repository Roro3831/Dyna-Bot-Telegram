const fetch = require('node-fetch'); // mandatory with nodeJS to work with fetch()


async function main() {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";

    async function test(url) {
        const response = await fetch(url);
        return response.json();
    }
    
    // test(url).then((data) => console.log(data[0][0]));
    
    // let test4 = await test(url);
    // test4 = test4;
    // console.log(test4.bitcoin.usd);
    let num = 1234567890.545425616516516;
    // num = num.toLocaleString()
    // num = Math.round(num*1000)/1000;
    num = num.toLocaleString("en-US",{minimumFractionDigits:6});
    
    console.log(num);
}
main();
// async function test2() {
//     let test3 = await fetch(url);
//     console.log(await test3);
// } 

// test2();