const { Command } = require('discord.js-commando');
const { Attachment } = require('discord.js');
const fs = require('fs');
const path = require('path');
const aliases = require('../../lib/aliases');

module.exports = class EmoteCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'emote',
            aliases: [
                'emo'
            ],
            group: 'emote',
            memberName: 'emote',
            description: 'Displays an emote',
            details: 'You can ask the emote to be displayed in a specific channel. To do so, add the channel name before the emote name.',
            format: '[channel] emote',
            examples: ['!emote hi', '!emo catalt'],
            argsCount: 2,
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var channel;
        var emote;
        if(args != 'undefined' && args != null && args.length >= 1) {
            if(args.length >= 2) {
                if(message.guild.available) {
                    channel = message.guild.channels.find("name", args[0]);
                }else{
                    this.printErrorMessage(message,"Sorry, I can't post in this channel...");
                    return;
                }
                emote = args[1];
            } else {
                channel = message.channel;
                emote = args[0];
            }
        } else {
            this.printErrorMessage(message, "You need to provide at least one argument.");
            return;
        }

        if(channel == 'undefined' || channel == null) {
            this.printErrorMessage(message,"Sorry, I could not find this channel...");
            return;
        }

        var location = this.getEmote(emote);

        if(location != 'undefined' && location != null) {
            try{
            channel.send(new Attachment(location));
            } catch (err) {
                console.log(err);
            }
        } else {
            this.printErrorMessage(message, "Sorry, I could not find this emote...");
            return;
        }
    }

    getEmote(emote) {
        var location;

        if(emote != 'undefined' && emote != null) {
            if(aliases.get(emote)) emote = aliases.get(emote);
            location = path.normalize(__dirname + "/../../lib/images/" + emote + ".png");
            if(!fs.existsSync(location)) location = null;
        }
        return location;
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply(errorMessage);
    }
}