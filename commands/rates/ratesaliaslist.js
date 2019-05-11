const { Command } = require('discord.js-commando');
const ratesAliases = require('../../lib/ratesaliases');

module.exports = class RatesAliasListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ratesaliaslist',
            aliases: [
                'listaliasrates',
                'listratesalias',
                'ratesaliaseslist',
                'listaliasesrates',
                'listratesaliases'
            ],
            group: 'rates',
            memberName: 'ratesaliaslist',
            description: 'Displays a list of all available aliases for rates',
            examples: ['!ratesaliaslist', '!listaliasrates'],
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

            var ratesAliasesServer = ratesAliases.get(id);
            if(ratesAliasesServer && Object.keys(ratesAliasesServer).length > 0){
                messages.push(await message.direct("List of all available aliases:\n"
                    + Object.entries(ratesAliasesServer).map(function([key, value]){
                        return key + " (" + value + ")";
                    }).join(", ")
                ));

                if(message.channel.type !== 'dm') messages.push(await message.reply('sent you a DM with the list.'));

            } else {
                messages.push(await message.reply("there are no aliases for rates on this server!"));
            }
        } catch(err) {
            console.log(err);
            messages.push(await message.reply('unable to send you the help DM. You probably have DMs disabled.'));
        }

        return messages;
    }
}