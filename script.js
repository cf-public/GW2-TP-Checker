apiKey = 0 // remove api key before commit

const bodyHandler = document.querySelector("body");

function getPrices(orders){
    // query the api for the prices
    let url = "https://api.guildwars2.com/v2/commerce/prices?ids=";
    url = url + orders.map(order=>order['item_id']).join(",");
    let prices = fetch(url).then((response)=>response.json()).catch(e=>console.log(e));
    return prices;
}

function getNames(orders){
    // query the names
    let url = "https://api.guildwars2.com/v2/items?ids=";
    url = url + orders.map(order=>order['item_id']).join(",");
    let names = fetch(url).then((response)=>response.json()).catch(e=>consolWe.log(e));
    return names;
}

function coinsToReadable(coins){
    // converts coins to gold, silver and copper
    let copper = coins%100;
    let silver = ((coins - copper)%10000)/100;
    let gold = (coins - silver*100 - copper)/10000;
    
    // format it nicely
    let g = `${gold}g`;
    let s = silver<10 ? `0${silver}s`:`${silver}s`;
    let c = copper<10 ? `0${copper}c`:`${copper}c`;
    return g+s+c;
}

function check(orders){
    let pricesPromise = getPrices(orders);
    let namesPromise = getNames(orders);

    Promise.all([pricesPromise, namesPromise]).then((data)=>{
        let prices = data[0];
        let names = data[1];
        // output = "Orders that are currently overbid : <br/>";
        let output =
        `<table>
        <tr>
            <th>Name</th><th>My Order</th><th>Highest Order</th>
        </tr>`;
        for (order of orders){
            let my_price = order["price"];
            let current_price = prices.filter(item=>{return (item['id'] == order['item_id']) })[0]['buys']['unit_price'];
            if (my_price < current_price){
                let item_name = names.filter(name=>{return (name['id'] == order['item_id']) })[0]['name'];
                // output = output + item_name + coinsToReadable(order['price']) +"<br/>";
                output = output + `<tr><td>${item_name}</td> <td class='coins'>${coinsToReadable(order['price'])}</td> <td class='coins'>${coinsToReadable(current_price)}</td></tr>`
            }
        }
        output = output + "</table>";
        bodyHandler.innerHTML=output;
    }).catch(e=>console.log(e));
}

function getOrders(){
    fetch("https://api.guildwars2.com/v2/commerce/transactions/current/buys?access_token="+apiKey).then((response)=>response.json())
    .then((orders)=>check(orders)).catch(e=>console.log(e));
}


if (apiKey==0){ // check the api key
    bodyHandler.innerHTML= "Please add an api key in the script.js file";
}
else{
    getOrders();
    setInterval(getOrders, 1000 * 60); // 1000ms * 60;
}
