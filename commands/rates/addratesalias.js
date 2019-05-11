const { Command } = require('discord.js-commando');
const ratesData = require('../../lib/ratesdata');
const ratesAliases = require('../../lib/ratesaliases');

module.exports = class AddRatesAliasCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addratesalias',
            aliases: [
                'addratealias'
            ],
            group: 'rates',
            memberName: 'addratesalias',
            description: 'Adds an alias for rates',
            format: '<rates ID> <alias>',
            examples: ['!addratesalias 123456 Flash'],
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        if(args.length == 2){
            var ratesID = args[0];
            var newRatesAlias = args[1];

            var tempRatesData = ratesData.get(ratesID);
            if (tempRatesData != 'undefined' && tempRatesData != null){
                var id;
                var guild = message.guild;
                if(guild != null){
                    id = guild.id;
                } else {
                    id = message.channel.id;
                }

                var ratesAliasesServer = ratesAliases.get(id);
                if (ratesAliasesServer == 'undefined' || ratesAliasesServer == null) ratesAliasesServer = {};

                if(!(newRatesAlias in ratesAliasesServer)){
                    this.printMessage(message, 'Alias added');
                            
                }else{
                    this.printMessage(message, "Alias updated");
                }

                ratesAliasesServer[newRatesAlias] = ratesID;
                ratesAliases.set(id, ratesAliasesServer);
            } else {
                this.printErrorMessage(message, "this ID is invalid");
            }
        }else{
            this.printErrorMessage(message, "you need to provide exactly two arguments");
        }
    }

    async printMessage(originalMessage, newMessage) {
        await originalMessage.channel.send(newMessage);
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply(errorMessage);
    }
}