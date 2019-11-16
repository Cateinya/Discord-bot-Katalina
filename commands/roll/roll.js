const { Command } = require('discord.js-commando');
const rng = require('../../lib/rng');
const rates = require('../../lib/ratesdata');
const ratesAliases = require('../../lib/ratesaliases');
const ratesInfo = require('../../lib/ratesinfo');

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
        var ratesAlias;
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
        
        for (var ratesaliasServer in ratesAliasesServer) {
            if (args.startsWith(ratesaliasServer)) {
                ratesAlias = ratesaliasServer;
                ratesID = ratesAliasesServer[ratesaliasServer];
                break;
            }
        }

        if (ratesID == 'undefined' || ratesID == null) {
            var IDs = Object.keys(rates.data);
            ratesID = IDs.pop();
        }

        var ratesInfoServer = ratesInfo.get(id);
        if (ratesInfoServer == 'undefined' || ratesInfoServer == null) ratesInfoServer = {};

        var info = ratesInfoServer[ratesID]; // can be null

        var result = rng.draw(ratesID, false);

        var msg = this.createDescription(result) + " " + this.createRatesDescription(ratesID, ratesAlias, info);

        message.channel.send("```ml\nYou Got: " + msg + "\n```");
    }

    createDescription(item) {
        var rateUp = (item["incidence"]) ? " ↑" : "";
		return (item["category_name"] == "Character Weapons") ? item["rarity"] + " " + item["character_name"] + rateUp + " (\"" + item["name"] + "\")" : "\"" + item["rarity"] + " " + item["name"] + "\"" + rateUp;
    }
    
    createRatesDescription(ratesID, ratesAlias, ratesInfo) {
        return "(on rates: "
            + ((ratesAlias != 'undefined' && ratesAlias != null) ? '"' + ratesAlias + '" - ' : "") 
            + ((ratesInfo != 'undefined' && ratesInfo != null) ? '"' + ratesInfo + '" - ' : "")
            + ratesID + ")";
    }
}