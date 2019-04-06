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
            format: 'emote',
            examples: ['!emote hi', '!emo catalt'],
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        if(args.length >= 1) {
            var emote = args[0];
            var channel = message.channel;
            
            var id;
            var guild = message.guild;
            if(guild != null){
                id = guild.id;
            } else {
                id = message.channel.id;
            }

            var location = this.getEmote(id, emote);

            if(location != 'undefined' && location != null) {
                try{
                    channel.send(new Attachment(location));
                } catch (err) {
                    console.log(err);
                }
            } else {
                this.printErrorMessage(message, "sorry, I could not find this emote...");
            }
        } else {
            this.printErrorMessage(message, "you need to provide at least one argument");
        }        
    }

    getEmote(id, emote) {
        var location;

        if(emote != 'undefined' && emote != null) {
            var aliasesServer = aliases.get(id);
            if (aliasesServer == 'undefined' || aliasesServer == null) aliasesServer = {};

            if(aliasesServer[emote]) emote = aliasesServer[emote];

            var locationGlobal = path.normalize(__dirname + "/../../lib/images/" + emote + ".png");
            
            if(fs.existsSync(locationGlobal)){
                location = locationGlobal;
            } else {

                var locationServer = path.normalize(__dirname + "/../../lib/images/" + id + "/" + emote + ".png");
                console.log(locationServer);
                if (fs.existsSync(locationServer)){
                    location = locationServer;
                }
            }
        }
        return location;
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply("TEST " + errorMessage);
    }
}