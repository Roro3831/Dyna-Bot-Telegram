const fetch = require('node-fetch'); // mandatory with nodeJS to work with fetch()


async function main() {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

    async function test(url) {
        const response = await fetch(url);
        return response.json();
    }
    
    // test(url).then((data) => console.log(data.ethereum.usd));
    
    let test4 = await test(url);
    test4 = test4.ethereum.usd;
    console.log(test4);

}
main();
// async function test2() {
//     let test3 = await fetch(url);
//     console.log(await test3);
// } 

// test2();