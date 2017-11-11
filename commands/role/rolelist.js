const { Command } = require('discord.js-commando');
const roles = require('../../lib/roles');

module.exports = class RoleListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'rolelist',
            aliases: [
                'listrole',
            ],
            group: 'role',
            memberName: 'rolelist',
            description: 'Displays a list of all available roles that can be added / removed',
            examples: ['!rolelist', '!listrole'],
            throttling: {
				usages: 1,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        
        const messages = [];
        try {
            messages.push(await message.direct("List of all available roles:\n"
                + Object.keys(roles.data).map(function(key){
                    return roles.get(key);
                }).join(", ")
            ));
            
            if(message.channel.type !== 'dm') messages.push(await message.reply('Sent you a DM with the list.'));
        } catch(err) {
            messages.push(await message.reply('Unable to send you the help DM. You probably have DMs disabled.'));
        }
        return messages;
    }
}