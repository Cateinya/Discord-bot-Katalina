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
        const messages = [];

        var id;
        var guild = message.guild;
        if(guild != null){
            id = guild.id;
        } else {
            id = message.channel.id;
        }

        var locationGlobal = path.normalize(__dirname + "/../../lib/images/");
        var locationServer = path.normalize(__dirname + "/../../lib/images/" + id + "/");

        if(fs.existsSync(locationGlobal)) {
            try {
                messages.push(await message.direct("List of all available global emotes:"));

                var emotesGlobal = this.getFiles(locationGlobal).map(file => file.substring(0, file.lastIndexOf('.')));

                while( emotesGlobal.length ) {
                    messages.push(await message.direct("```" + emotesGlobal.splice(0, 150).join(", ") + "```"));
                }

                if(fs.existsSync(locationServer)) {
                    messages.push(await message.direct("List of all available server emotes:"));

                    var emotesServer = this.getFiles(locationServer).map(file => file.substring(0, file.lastIndexOf('.')));
                    
                    while( emotesServer.length ) {
                        messages.push(await message.direct("```" + emotesServer.splice(0, 150).join(", ") + "```"));
                    }
                }
                
                if(message.channel.type !== 'dm') messages.push(await message.reply('sent you a DM with the list'));
            } catch(err) {
                messages.push(await message.reply('unable to send you the help DM. You probably have DMs disabled'));
            }
        } else {
            message.reply("there was an error while retrieving the list of available emotes");
        }
        return messages;
    }

    getFiles (srcpath) {
        return fs.readdirSync(srcpath)
            .filter(file => fs.statSync(path.join(srcpath, file)).isFile())
    }
}