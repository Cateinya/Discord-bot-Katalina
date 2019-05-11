const { Command } = require('discord.js-commando');
const ratesAliases = require('../../lib/ratesaliases');

module.exports = class RemoveRatesAliasCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'removeratesalias',
            aliases: [
                'removeratealias',
                'removeratesaliases',
                'removeratealiases'
            ],
            group: 'rates',
            memberName: 'removeratesalias',
            description: 'Removes an alias for rates',
            details: 'You can provide more than one alias to be removed. To do so, just add them separated by a white space.',
            format: '<alias>',
            examples: ['!removeratesalias Flash', '!removeratesaliases Flash Legfest'],
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

            var ratesAliasesServer = ratesAliases.get(id);
            if (ratesAliasesServer == 'undefined' || ratesAliasesServer == null) ratesAliasesServer = {};

            var aliasError = [];

            for(var i = 0; i < args.length; i++){
                var alias = args[i];

                if(alias in ratesAliasesServer){
                    delete ratesAliasesServer[alias];
                }else{
                    aliasError.push(alias);
                }
            }

            ratesAliases.set(id, ratesAliasesServer);

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