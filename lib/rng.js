const rates = require('./ratesdata');

class RNG {

    randomInt(low, high){
        return Math.floor(Math.random() * (high - low) + low);
    }

    draw(ratesID, tenth){
        if (ratesID == 'undefined' || ratesID == null || ratesID == "latest") {
            var IDs = Object.keys(rates.data);
            ratesID = IDs.pop();
        }

        var rarity = this.rarityRoll(ratesID, tenth);

        var itemSubList = this.firstPassRoll(ratesID, rarity);

        var item = this.secondPassRoll(ratesID, rarity, itemSubList["category_name"], itemSubList["drop_rate"]);

        item["rarity"] = rarity;
        item["category_name"] = itemSubList["category_name"];
        item["drop_rate"] =  itemSubList["drop_rate"];

        return item;
    }

    rarityRoll(ratesID, tenth){
        var rarity;
    
        var rand = Math.random();
        
        var ssr_drop_rate = rates.data[ratesID]["SS Rare"]["drop_rate"];
        var sr_drope_rate = rates.data[ratesID]["S Rare"]["drop_rate"];
        
        if(rand < ssr_drop_rate){
            rarity = "SS Rare";
        }else if(tenth || rand < ( ssr_drop_rate + sr_drope_rate ) ){
            rarity = "S Rare";
        }else{
            rarity = "Rare";
        }
    
        return rarity;
    }
    
    firstPassRoll(ratesID, rarity){
        var total_items = 0;
        
        if (rates.data[ratesID][rarity]["Character Weapons"]){
            for (var key in rates.data[ratesID][rarity]["Character Weapons"]){
                total_items += rates.data[ratesID][rarity]["Character Weapons"][key]['total_rate'];
            }
        }
    
        if (rates.data[ratesID][rarity]["Non-Character Weapons"]){
            for (var key in rates.data[ratesID][rarity]["Non-Character Weapons"]){
                total_items += rates.data[ratesID][rarity]["Non-Character Weapons"][key]['total_rate'];
            }
        }
    
        if (rates.data[ratesID][rarity]["Summon"]){
            for (var key in rates.data[ratesID][rarity]["Summon"]){
                total_items += rates.data[ratesID][rarity]["Summon"][key]['total_rate'];
            }
        }
    
        var rand = this.randomInt(0, total_items);
    
        if (rates.data[ratesID][rarity]["Character Weapons"]){
            for (var key in rates.data[ratesID][rarity]["Character Weapons"]){
                rand -= rates.data[ratesID][rarity]["Character Weapons"][key]['total_rate'];
                if (rand <= 0){
                    return {'category_name' : "Character Weapons", 'drop_rate' : key};
                }
            }
        }
    
        if (rates.data[ratesID][rarity]["Non-Character Weapons"]){
            for (var key in rates.data[ratesID][rarity]["Non-Character Weapons"]){
                rand -= rates.data[ratesID][rarity]["Non-Character Weapons"][key]['total_rate'];
                if (rand <= 0){
                    return {'category_name' : "Non-Character Weapons", 'drop_rate' : key};
                }
            }
        }
    
        if (rates.data[ratesID][rarity]["Summon"]){
            for (var key in rates.data[ratesID][rarity]["Summon"]){
                rand -= rates.data[ratesID][rarity]["Summon"][key]['total_rate'];
                if (rand <= 0){
                    return {'category_name' : "Summon", 'drop_rate' : key};
                }
            }
        }
    }
    
    secondPassRoll(ratesID, rarity, category_name, drop_rate){
        var rand = this.randomInt(0, rates.data[ratesID][rarity][category_name][drop_rate]["count"]);
        return rates.data[ratesID][rarity][category_name][drop_rate]["list"][rand];
    }
}

var rng = new RNG();

module.exports = rng;