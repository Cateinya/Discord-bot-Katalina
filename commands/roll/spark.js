const { Command } = require('discord.js-commando');
const rng = require('../../lib/rng');

const R = 1;
const SR = 2;
const SSR = 3;
const SPARK_DRAW_COUNT = 300;

module.exports = class RollCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'spark',
            group: 'roll',
            memberName: 'spark',
            description: 'Performs a spark using 30 10-part draws.',
            examples: ['!spark', '!spark'],
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var draws = {"weapons" : {}, "noncharacter_weapons" : {}, "summons" : {}};
        var total = 0;
		// Would be possible to do all the tenth draws first and then all the 270 remaining but, in the 
		// spirit of doing the same as a real spark, let loop 30 times on a 10-draw
		for (var i = 0; i < SPARK_DRAW_COUNT / 10; i ++) {
			for (var j = 0; j < 10; j++ ){
                var draw = rng.draw(j == 9);
                draw["draw_count"] = 1; 
                if (draw["rarity"] == "SS Rare") {
                    total += 1;

                    if(draw["category_name"] == "Summon") {
                        if (draws["summons"][draw["name"]]) {
                            draws["summons"][draw["name"]]["draw_count"] +=1;
                        } else {
                            draws["summons"][draw["name"]] = draw;
                        }
                    } else if(draw["category_name"] == "Character Weapons"){
                        if (draws["weapons"][draw["name"]]) {
                            draws["weapons"][draw["name"]]["draw_count"] +=1;
                        } else {
                            draws["weapons"][draw["name"]] = draw;
                        }
                    } else {
                        if (draws["noncharacter_weapons"][draw["name"]]) {
                            draws["noncharacter_weapons"][draw["name"]]["draw_count"] +=1;
                        } else {
                            draws["noncharacter_weapons"][draw["name"]] = draw;
                        }
                    }
                }
			}
        }

        var weapons = [];
        var noncharacter_weapons = []
        var summons = [];

        for (var weapon in draws["weapons"]) {
            weapons.push(this.createDescription(draws["weapons"][weapon]));
        }

        for (var noncharacter_weapon in draws["noncharacter_weapons"]) {
            noncharacter_weapons.push(this.createDescription(draws["noncharacter_weapons"][noncharacter_weapon]));
        }

        for (var summon in draws["summons"]) {
            summons.push(this.createDescription(draws["summons"][summon]));
        }

        weapons.sort();
        noncharacter_weapons.sort();
        summons.sort();
        
        var msg = "```ml\nYou Got " + total + " SSRs (" + (total/SPARK_DRAW_COUNT*100).toFixed(2) + "%):";
        
        msg += (weapons.length > 0) ? "\n\n'Weapons': " + weapons.join(", "): "";
        
        msg += (noncharacter_weapons.length > 0) ? "\n\n'Non_Character_Weapons': " + noncharacter_weapons.join(", ") : "";

        msg += (summons.length > 0) ? "\n\n'Summons': " + summons.join(", ") : "";

        msg += "\n```";


        if (msg.length > 2000) {
            msg = msg.substr(0, 1992) + "...\n```";
        }

        message.channel.send(msg);
    }
	
	createDescription(item) {
        var rateUp = (item["incidence"]) ? " ↑" : "";
        var dupes = (item["draw_count"] > 1) ? " x" + item["draw_count"] : "";

		return (item["category_name"] == "Character Weapons") ? item["character_name"] + rateUp + " (\"" + item["name"] + "\")" + dupes : "\"" + item["name"] + "\"" + rateUp + dupes;
    }
}