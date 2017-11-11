const rates = require('./rates');

class RNG {

    randomInt(low, high){
        return Math.floor(Math.random() * (high - low) + low);
    }

    draw(tenth, legfest){
        
        var result;

        var rarity = this.rarityRoll(tenth, legfest);

        var itemSubList = this.firstPassRoll(rarity);

        var item = this.secondPassRoll(itemSubList);

        var result = rarity + " ";

        if (item["character_name"]){
            result += item["character_name"] + " (" + item["name"] + ")";
        } else {
            result += item["name"];
        }

        return result;
    }

    rarityRoll(tenth, legfest){
        var rarity;
    
        var rand = Math.random();
        
        var ssr_drop_rate = legfest ? rates.data["SS Rare"]["drop_rate"] * 2 : rates.data["SS Rare"]["drop_rate"];
        
        if(rand < ssr_drop_rate){
            rarity = "SS Rare";
        }else if(tenth || rand < ( ssr_drop_rate + rates.data["S Rare"]["drop_rate"] ) ){
            rarity = "S Rare";
        }else{
            rarity = "Rare";
        }
    
        return rarity;
    }
    
    firstPassRoll(rarity){
        var subList;
        var total_items = 0;
        
        if (rates.data[rarity]["Character Weapons"]){
            for (var key in rates.data[rarity]["Character Weapons"]){
                total_items += rates.data[rarity]["Character Weapons"][key]['total_rate'];
            }
        }
    
        if (rates.data[rarity]["Non-Character Weapons"]){
            for (var key in rates.data[rarity]["Non-Character Weapons"]){
                total_items += rates.data[rarity]["Non-Character Weapons"][key]['total_rate'];
            }
        }
    
        if (rates.data[rarity]["Summon"]){
            for (var key in rates.data[rarity]["Summon"]){
                total_items += rates.data[rarity]["Summon"][key]['total_rate'];
            }
        }
    
        var rand = this.randomInt(0, total_items);
    
        if (rates.data[rarity]["Character Weapons"]){
            for (var key in rates.data[rarity]["Character Weapons"]){
                rand -= rates.data[rarity]["Character Weapons"][key]['total_rate'];
                if (rand <= 0){
                    return rates.data[rarity]["Character Weapons"][key];
                }
            }
        }
    
        if (rates.data[rarity]["Non-Character Weapons"]){
            for (var key in rates.data[rarity]["Non-Character Weapons"]){
                rand -= rates.data[rarity]["Non-Character Weapons"][key]['total_rate'];
                if (rand <= 0){
                    return rates.data[rarity]["Non-Character Weapons"][key];
                }
            }
        }
    
        if (rates.data[rarity]["Summon"]){
            for (var key in rates.data[rarity]["Summon"]){
                rand -= rates.data[rarity]["Summon"][key]['total_rate'];
                if (rand <= 0){
                    return rates.data[rarity]["Summon"][key];
                }
            }
        }
    }
    
    secondPassRoll(itemSubList){
        var rand = this.randomInt(0, itemSubList["count"]);
        return itemSubList["list"][rand];
    }
}

var rng = new RNG();

module.exports = rng;