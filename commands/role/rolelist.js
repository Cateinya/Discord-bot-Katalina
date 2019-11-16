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
            guildOnly: true,
            memberName: 'rolelist',
            description: 'Displays a list of all available roles that can be added / removed',
            examples: ['!rolelist', '!listrole'],
            throttling: {
				usages: 1,
				duration: 10
            }
        });
    }
    
    async run(message) {
        
        const messages = [];
        try {
            var guild = message.guild;
            if(guild != null){
                var rolesGuild = roles.get(guild.id);
                if(rolesGuild && Object.keys(rolesGuild).length > 0){
                    messages.push(await message.direct("List of all available roles:\n"
                        + Object.keys(rolesGuild).map(function(key){
                            return rolesGuild[key];
                        }).join(", ")
                    ));

                    messages.push(await message.reply('sent you a DM with the list.'));

                } else {
                    messages.push(await message.reply("there are no assignable roles on this server!"));
                }
            } else {
                messages.push(await message.reply("you can not use this command here!"));
            }
        } catch(err) {
            console.log(err);
            messages.push(await message.reply('unable to send you the help DM. You probably have DMs disabled.'));
        }
        
        return messages;
    }
}