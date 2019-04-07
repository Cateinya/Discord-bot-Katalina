const rates = require('./rates');

class RNG {

    randomInt(low, high){
        return Math.floor(Math.random() * (high - low) + low);
    }

    draw(tenth){
        
        var result;

        var rarity = this.rarityRoll(tenth);

        var itemSubList = this.firstPassRoll(rarity);

        var item = this.secondPassRoll(rarity, itemSubList["category_name"], itemSubList["drop_rate"]);

        item["rarity"] = rarity;
        item["category_name"] = itemSubList["category_name"];
        item["drop_rate"] =  itemSubList["drop_rate"];

        /*var result = rarity + " ";

        if (item["character_name"]){
            result += item["character_name"] + " (" + item["name"] + ")";
        } else {
            result += item["name"];
        }*/

        return item;
    }

    rarityRoll(tenth){
        var rarity;
    
        var rand = Math.random();
        
        var ssr_drop_rate = rates.data["SS Rare"]["drop_rate"];
        var sr_drope_rate = rates.data["S Rare"]["drop_rate"];
        
        if(rand < ssr_drop_rate){
            rarity = "SS Rare";
        }else if(tenth || rand < ( ssr_drop_rate + sr_drope_rate ) ){
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
                    return {'category_name' : "Character Weapons", 'drop_rate' : key};
                }
            }
        }
    
        if (rates.data[rarity]["Non-Character Weapons"]){
            for (var key in rates.data[rarity]["Non-Character Weapons"]){
                rand -= rates.data[rarity]["Non-Character Weapons"][key]['total_rate'];
                if (rand <= 0){
                    return {'category_name' : "Non-Character Weapons", 'drop_rate' : key};
                }
            }
        }
    
        if (rates.data[rarity]["Summon"]){
            for (var key in rates.data[rarity]["Summon"]){
                rand -= rates.data[rarity]["Summon"][key]['total_rate'];
                if (rand <= 0){
                    return {'category_name' : "Summon", 'drop_rate' : key};
                }
            }
        }
    }
    
    secondPassRoll(rarity, category_name, drop_rate){
        var rand = this.randomInt(0, rates.data[rarity][category_name][drop_rate]["count"]);
        return rates.data[rarity][category_name][drop_rate]["list"][rand];
    }
}

var rng = new RNG();

module.exports = rng;