const { Command } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const aliases = require('../../lib/aliases');

module.exports = class AddAliasCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addalias',
            group: 'alias',
            memberName: 'addalias',
            description: 'Adds an alias',
            format: '<emote> <alias>',
            examples: ['!addalias wut catalt', '!addalias subarashii aki'],
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        if(args.length == 2){
            var id;
            var guild = message.guild;
            if(guild != null){
                id = guild.id;
            } else {
                id = message.channel.id;
            }

            var aliasesServer = aliases.get(id);
            if (aliasesServer == 'undefined' || aliasesServer == null) aliasesServer = {};

            var emote = args[0];
            var alias = args[1];

            if(!(alias in aliasesServer)){
                if(this.getEmote(id, emote)){
                    if(!this.getEmote(id, alias)){
                        aliasesServer[alias] = emote;
                        aliases.set(id, aliasesServer);

                        this.printMessage(message, 'Alias added');
                        
                    }else{
                        this.printErrorMessage(message, "you can not create this alias, there is already an emote with this name!");
                    }
                }else{
                    this.printErrorMessage(message, "this emote does not exists!");
                }
            }else{
                this.printErrorMessage(message, "this alias already exists!");
            }
        }else{
            this.printErrorMessage(message, "you need to provide exactly two arguments");
        }
    }

    getEmote(id, emote) {
        var location;

        if(emote != 'undefined' && emote != null) {

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

    async printMessage(originalMessage, newMessage) {
        await originalMessage.channel.send(newMessage);
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply(errorMessage);
    }
}