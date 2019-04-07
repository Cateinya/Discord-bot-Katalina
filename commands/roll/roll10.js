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
        var results = [];

        for (var j = 0; j < 10; j++ ){
            var result = rng.draw((j == 9));
            results.push(this.createDescription(result));
        }

        message.channel.send("```ml\nYou Got:\n\n" + results.join(", ")+"\n```");
    }

    createDescription(item) {
        var rateUp = (item["incidence"]) ? " ↑" : "";
		return (item["category_name"] == "Character Weapons") ? item["rarity"] + " " + item["character_name"] + rateUp + " (\"" + item["name"] + "\")" : item["rarity"] + " " + item["name"] + rateUp;
	}
}