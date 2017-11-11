const { Command } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const aliases = require('../../lib/aliases');

module.exports = class EmoteListCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'emotelist',
            aliases: [
                'emolist',
                'listemote',
                'listemo'
            ],
            group: 'emote',
            memberName: 'emotelist',
            description: 'Displays a list of all available emotes',
            examples: ['!emotelist', '!emolist'],
            throttling: {
				usages: 1,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var location = path.normalize(__dirname + "/../../lib/images/");
        if(!fs.existsSync(location)) {
            message.reply("There was an error while retrieving the list of available emotes.");
            return;
        }
        var emotes = this.getFiles(location).map(file => file.substring(0, file.lastIndexOf('.')));

        const messages = [];
        try {
            messages.push(await message.direct("List of all available emotes:\n"));
            while( emotes.length ) {
                messages.push(await message.direct("```" + emotes.splice(0, 150).join(", ") + "```"));
            }
            
            if(message.channel.type !== 'dm') messages.push(await message.reply('Sent you a DM with the list.'));
        } catch(err) {
            messages.push(await message.reply('Unable to send you the help DM. You probably have DMs disabled.'));
        }
        return messages;
    }

    getFiles (srcpath) {
        return fs.readdirSync(srcpath)
            .filter(file => fs.statSync(path.join(srcpath, file)).isFile())
    }
}