apiKey = 0 // remove api key before commit

bodyHandler = document.querySelector("body");

function getPrices(orders){
    // query the api for the prices
    url = "https://api.guildwars2.com/v2/commerce/prices?ids=";
    for (item of orders){
        url = url + item['item_id'] + ",";
    }
    prices = fetch(url).then((response)=>response.json()).catch(e=>console.log(e));
    return prices
}

function getNames(orders){
    // query the names
    url = "https://api.guildwars2.com/v2/items?ids=";
    for (item of orders){
        url = url + item['item_id'] + ",";
    }
    names = fetch(url).then((response)=>response.json()).catch(e=>consolWe.log(e));
    return names;
}

function coinsToReadable(coins){
    // converts coins to gold, silver and copper
    copper = coins%100
    silver = ((coins - copper)%10000)/100
    gold = (coins - silver*100 - copper)/10000
    
    // format it nicely
    g = `${gold}g`
    s = `${silver}s`
    c = `${copper}c`
    if (silver<10){
        s = "0"+s
    }
    if (copper<10){
        c = "0"+c
    }


    return g+s+c
}
function check(orders){
    pricesPromise = getPrices(orders);
    namesPromise = getNames(orders);

    Promise.all([pricesPromise, namesPromise]).then((data)=>{
        prices = data[0];
        names = data[1];
        // output = "Orders that are currently overbid : <br/>";
        output =
        `<table>
        <tr>
            <th>Name</th><th>My Order</th><th>Highest Order</th>
        </tr>`;
        for (order of orders){
            my_price = order["price"];
            current_price = prices.filter(item=>{return (item['id'] == order['item_id']) })[0]['buys']['unit_price'];
            if (my_price < current_price){
                item_name = names.filter(name=>{return (name['id'] == order['item_id']) })[0]['name'];
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
    setInterval(getOrders, 1000 * 60); // 1000ms * 60
}


if (apiKey==0){ // check the api key
    body.innerHTML= "Please add an api key in the script.js file";
}
else{
    getOrders();
}

