const { Command } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
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
    
    async run(message, args) {
        const messages = [];
        try {
            messages.push(await message.direct("\nList of all available aliases:\n```" +
                Object.keys(aliases.data).map(key =>  key + " => " + aliases.get(key)).join(", ") + "\n```"
            ));
            
            if(message.channel.type !== 'dm') messages.push(await message.reply('Sent you a DM with the list.'));
        } catch(err) {
            messages.push(await message.reply('Unable to send you the help DM. You probably have DMs disabled.'));
        }
        return messages;
    }
}