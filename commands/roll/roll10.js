const { Command } = require('discord.js-commando');
const rng = require('../../lib/rng');

module.exports = class Roll10Command extends Command {
    constructor(client) {
        super(client, {
            name: 'roll10',
            group: 'roll',
            memberName: 'roll10',
            description: 'Performs a Premium 10-part draw.',
            examples: ['!roll10'],
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var draws = {"weapons" : {}, "noncharacter_weapons" : {}, "summons" : {}};

        for (var j = 0; j < 10; j++ ){
            var draw = rng.draw((j == 9));

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
        
        var msg = "```ml\nYou Got:";
        
        msg += (weapons.length > 0) ? "\n\n'Weapons': " + weapons.join(", "): "";
        
        msg += (noncharacter_weapons.length > 0) ? "\n\n'Non_Character_Weapons': " + noncharacter_weapons.join(", ") : "";

        msg += (summons.length > 0) ? "\n\n'Summons': " + summons.join(", ") : "";

        msg += "\n```";

        message.channel.send(msg);
    }

    createDescription(item) {
        var rateUp = (item["incidence"]) ? " ↑" : "";
        var dupes = (item["draw_count"] > 1) ? " x" + item["draw_count"] : "";

		return (item["category_name"] == "Character Weapons") ? item["rarity"] + " " + item["character_name"] + rateUp + " (\"" + item["name"] + "\")" + dupes : "\"" + item["rarity"] + " " + item["name"] + "\"" + rateUp + dupes;
	}
}