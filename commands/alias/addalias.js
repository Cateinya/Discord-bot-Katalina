const { Command } = require('discord.js-commando');
const aliases = require('../../lib/aliases');

module.exports = class AddAliasCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addalias',
            group: 'alias',
            memberName: 'addalias',
            description: 'Adds an alias',
            format: '<emote> <alias>',
            examples: ['!addalias wut catalt', '!addalias subarashii aki'],
            argsCount: 2,
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        if(args.length == 2){
            aliases.set(args[1], args[0]);
            message.channel.send("Alias added.");
        }else{
            message.reply("You need to provide exactly 2 arguments");
        }
    }
}