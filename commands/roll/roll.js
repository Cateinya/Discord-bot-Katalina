const { Command } = require('discord.js-commando');
const rng = require('../../lib/rng');

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            group: 'roll',
            memberName: 'roll',
            description: 'Performs a Premium draw.',
            examples: ['!roll'],
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var result = rng.draw(false);

        
        var msg = this.createDescription(result);

        message.channel.send("```ml\nYou Got " + msg +"\n```");
    }

    createDescription(item) {
        var rateUp = (item["incidence"]) ? " ↑" : "";
		return (item["category_name"] == "Character Weapons") ? item["rarity"] + " " + item["character_name"] + rateUp + " (\"" + item["name"] + "\")" : item["rarity"] + " " + item["name"] + rateUp;
	}
}