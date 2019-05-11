const { Command } = require('discord.js-commando');
const ratesData = require('../../lib/ratesdata');
const ratesInfo = require('../../lib/ratesinfo');
const ratesAliases = require('../../lib/ratesaliases');

module.exports = class RatesListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rateslist',
            aliases: [
                'listrates'
            ],
            group: 'rates',
            memberName: 'rateslist',
            description: 'Displays a list of all available rates',
            examples: ['!rateslist', '!listrates'],
            throttling: {
				usages: 1,
				duration: 10
            }
        });
    }
    
    async run(message, args) {

        const messages = [];
        try {
            var id;
            var guild = message.guild;
            if(guild != null){
                id = guild.id;
            } else {
                id = message.channel.id;
            } 

            var ratesInfoServer = ratesInfo.get(id);
            if (ratesInfoServer == 'undefined' || ratesInfoServer == null) ratesInfoServer = {};

            var ratesAliasesServer = ratesAliases.get(id);
            if (ratesAliasesServer == 'undefined' || ratesAliasesServer == null) ratesAliasesServer = {};

            var ratesAliasesServerReverse = {};
            for (var alias in ratesAliasesServer) {
                if (!ratesAliasesServerReverse[ratesAliasesServer[alias]]){
                    ratesAliasesServerReverse[ratesAliasesServer[alias]] = [];
                }
                ratesAliasesServerReverse[ratesAliasesServer[alias]].push(alias);
            }

            messages.push(await message.direct("List of all available rates:\n"
                    + Object.keys(ratesData.data).reverse().map(function(key){
                        var info = ratesInfoServer[key];
                        if (info == 'undefined' || info == null) info = "No information";

                        var listAliases;
                        var aliases = ratesAliasesServerReverse[key];
                        if (aliases == 'undefined' || aliases == null) {
                            listAliases = "";
                        } else {
                            listAliases = " (alias: " + ratesAliasesServerReverse[key].join(", ") + ")";
                        }

                        return key + " - " + info + listAliases;
                    }).join("\n")
                ));
            
                if(message.channel.type !== 'dm') messages.push(await message.reply('sent you a DM with the list.'));
        } catch(err) {
            console.log(err);
            messages.push(await message.reply('unable to send you the help DM. You probably have DMs disabled.'));
        }

        return messages;
    }
}