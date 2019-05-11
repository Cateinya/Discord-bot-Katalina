const { Command } = require('discord.js-commando');
const rng = require('../../lib/rng');
const ratesAliases = require('../../lib/ratesaliases');

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            group: 'roll',
            memberName: 'roll',
            description: 'Performs a Premium draw.',
            details: 'You can add an alias to use specific rates insted of the latest.',
            examples: ['!roll', '!roll Flash'],
            argsCount: 1,
            argsType: "single",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var ratesID;

        var id;
        var guild = message.guild;
        if(guild != null){
            id = guild.id;
        } else {
            id = message.channel.id;
        }

        var ratesAliasesServer = ratesAliases.get(id);
        if (ratesAliasesServer == 'undefined' || ratesAliasesServer == null) ratesAliasesServer = {};
        
        for (var ratesalias in ratesAliasesServer) {
            if (args.startsWith(ratesalias)) {
                ratesID = ratesAliasesServer[ratesalias];
                break;
            }
        }

        if (ratesID == 'undefined' || ratesID == null) ratesID = "latest";

        var result = rng.draw(ratesID, false);

        var msg = this.createDescription(result);

        message.channel.send("```ml\nYou Got: " + msg + " (on rates: " + ratesID + ")\n```");
    }

    createDescription(item) {
        var rateUp = (item["incidence"]) ? " ↑" : "";
		return (item["category_name"] == "Character Weapons") ? item["rarity"] + " " + item["character_name"] + rateUp + " (\"" + item["name"] + "\")" : "\"" + item["rarity"] + " " + item["name"] + "\"" + rateUp;
	}
}