const { Command } = require('discord.js-commando');
const aliases = require('../../lib/aliases');

module.exports = class AliasListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'aliaslist',
            aliases: [
                'listalias'
            ],
            group: 'alias',
            memberName: 'aliaslist',
            description: 'Displays a list of all available aliases',
            examples: ['!aliaslist', '!listalias'],
            throttling: {
				usages: 1,
				duration: 10
            }
        });
    }
    
    async run(message) {

        const messages = [];
        try {
            var id;
            var guild = message.guild;
            if(guild != null){
                id = guild.id;
            } else {
                id = message.channel.id;
            } 

            var aliasesServer = aliases.get(id);
            if(aliasesServer && Object.keys(aliasesServer).length > 0){
                messages.push(await message.direct("List of all available aliases:\n"
                    + Object.entries(aliasesServer).map(function([key, value]){
                        return key + " (" + value + ")";
                    }).join(", ")
                ));

                if(message.channel.type !== 'dm') messages.push(await message.reply('sent you a DM with the list.'));

            } else {
                messages.push(await message.reply("there are no aliases on this server!"));
            }
        } catch(err) {
            console.log(err);
            messages.push(await message.reply('unable to send you the help DM. You probably have DMs disabled.'));
        }

        return messages;
    }
}