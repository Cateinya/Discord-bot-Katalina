const { Command } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const aliases = require('../../lib/aliases');

module.exports = class RemoveAliasCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'removealias',
            aliases: [
                'removealiases'
            ],
            group: 'alias',
            memberName: 'removealias',
            description: 'Removes an alias',
            details: 'You can provide more than one alias to be removed. To do so, just add them separated by a white space.',
            format: '<alias> [anotherAlias ...]',
            examples: ['!removealias catalt', '!removealiases aki catalt'],
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        if(args.length > 0){
            var id;
            var guild = message.guild;
            if(guild != null){
                id = guild.id;
            } else {
                id = message.channel.id;
            }

            var aliasesServer = aliases.get(id);
            if (aliasesServer == 'undefined' || aliasesServer == null) aliasesServer = {};

            var aliasError = [];

            for(var i = 0; i < args.length; i++){
                var alias = args[i];

                if(alias in aliasesServer){
                    delete aliasesServer[alias];
                }else{
                    aliasError.push(alias);
                }
            }

            aliases.set(id, aliasesServer);

            if (aliasError.length == 0){
                this.printMessage(message, 'Alias(es) removed');
            } else {
                this.printErrorMessage(message, "some alias(es) could not be removed: " + aliasError.join(", ") + " (Not found)");
            }

        }else{
            this.printErrorMessage(message, "you need to provide at least one argument");
        }
    }

    async printMessage(originalMessage, newMessage) {
        await originalMessage.channel.send(newMessage);
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply(errorMessage);
    }
}