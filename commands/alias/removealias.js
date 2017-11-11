const { Command } = require('discord.js-commando');
const aliases = require('../../lib/aliases');

module.exports = class RemoveAliasCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'removealias',
            group: 'alias',
            memberName: 'removealias',
            description: 'Removes an alias',
            format: '<emote> <alias>',
            examples: ['!removealias catalt', '!removealias aki'],
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var argsList = args.split(/\s+/);
        if(argsList.length == 1){
            aliases.remove(argsList[0]);
            await message.channel.send("Alias removed.");
        }else{
            await message.reply("You need to provide exactly 1 argument");
        }
    }
}