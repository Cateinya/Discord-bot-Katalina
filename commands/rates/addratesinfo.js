const { Command } = require('discord.js-commando');
const ratesData = require('../../lib/ratesdata');
const ratesInfo = require('../../lib/ratesinfo');

module.exports = class AddRatesInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addratesinfo',
            aliases: [
                'addratesinfos',
                'addratesinformation',
                'addratesinformations'
            ],
            group: 'rates',
            memberName: 'addratesinfo',
            description: 'Adds information for rates',
            format: '<rates ID> <information>',
            examples: ['!addratesinfo 123456 Flash Gala March 2019'],
            argsCount: 2,
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        if(args.length == 2){
            var ratesID = args[0];
            var newRatesInfo = args[1];

            var tempRatesData = ratesData.get(ratesID);
            if (tempRatesData != 'undefined' && tempRatesData != null){
                var id;
                var guild = message.guild;
                if(guild != null){
                    id = guild.id;
                } else {
                    id = message.channel.id;
                }

                var ratesInfoServer = ratesInfo.get(id);
                if (ratesInfoServer == 'undefined' || ratesInfoServer == null) ratesInfoServer = {};

                if(!(ratesID in ratesInfoServer)){
                    this.printMessage(message, 'Information added');
                            
                }else{
                    this.printMessage(message, "Information updated");
                }

                ratesInfoServer[ratesID] = newRatesInfo;
                ratesInfo.set(id, ratesInfoServer);
            } else {
                this.printErrorMessage(message, "this ID is invalid");
            }
        }else{
            this.printErrorMessage(message, "you need to provide exactly two arguments");
        }
    }

    async printMessage(originalMessage, newMessage) {
        await originalMessage.channel.send(newMessage);
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply(errorMessage);
    }
}