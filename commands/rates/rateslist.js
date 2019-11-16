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
            examples: ['!rateslist [all]', '!listrates [all]'],
            argsCount: 1,
            argsType: "single",
            throttling: {
				usages: 1,
				duration: 10
            }
        });
    }
    
    async run(message, arg) {
        const messages = [];
        
        var returnAllRates = (arg == "all");

        try {
            var id;
            var guild = message.guild;
            if (guild != null) {
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

            var responseArray = [];

            Object.keys(ratesData.data).reverse().map(function(key){
                var info = ratesInfoServer[key];
                if (info == 'undefined' || info == null) info = "No information";

                var listAliases;
                var aliases = ratesAliasesServerReverse[key];
                if (aliases == 'undefined' || aliases == null) {
                    listAliases = "";
                } else {
                    listAliases = " (alias: " + ratesAliasesServerReverse[key].join(", ") + ")";
                }

                responseArray.push(key + " - " + info + listAliases + "\n");
            });

            var ratesToReturn = (!returnAllRates) ? Math.min(responseArray.length, 10) : responseArray.length;

            var responseTemp = "List of "
                + ((ratesToReturn < responseArray.length)? "the last " + ratesToReturn : "all available") + " rates:\n";
            

            for (var i = 0; i < ratesToReturn; i++) {
                // push a new message if it will exceed the 2000 character limit
                if (responseTemp.length + responseArray[i].length >= 2000) {
                    messages.push(await message.direct(responseTemp));
                    responseTemp = "";
                }

                responseTemp += responseArray[i];
            }
            
            // push the last message
            if (responseTemp != "") {
                messages.push(await message.direct(responseTemp));
            }
            
            if(message.channel.type !== 'dm') messages.push(await message.reply('sent you a DM with the list.'));
        } catch(err) {
            console.log(err);
            messages.push(await message.reply('unable to send you the help DM. You probably have DMs disabled.'));
        }

        return messages;
    }
}