const { Command } = require('discord.js-commando');
var request = require('request');
var curlToJson = require('curl-to-json');
var fs = require('fs');
const rateParser = require('../../lib/rateparser');

module.exports = class UpdateRatesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'updaterates',
            aliases: [
                'updaterate'
            ],
            group: 'roll',
            memberName: 'updaterates',
            description: 'Update the premium draw rates using the attached document.',
            details : 'You can send the source code from the draw rate page using a cURL or directly via the json file.',
            examples: ['!updaterates curl \'http://game.granbluefantasy.jp/gacha/appear/legend/24881[...]', '!updaterate <drag_and_drop_a_json_file>'],
            argsCount: 1,
            argsType: "single",
            throttling: {
				usages: 1,
				duration: 10
            }
        });
    }
    
    async run(message, arg) {
        var fileName = "rates.json";

        if (message.attachments.size > 0){
            console.log(message.attachments.first().url);
            var fileURL = message.attachments.first().url;
        }
        else if (arg){
            try{
                var fileURL = curlToJson(arg);
            } catch (err) {
                this.printErrorMessage(message, "An error occured while retrieving the cURL. Did you submit a correct one?");
            }
            
        } else {
            this.printErrorMessage(message, "You need to either provide an attachment or an URL!");
        }

        if (fileURL != 'undefined' && fileURL){
            request.get(fileURL, function(error, response, body) {
                if(error){
                    this.printErrorMessage(message, "An error ocurred while retrieving the rates. Did you submit the correct URL or file?");
                    return;
                } else {
                    if (rateParser.parse(body)){
                        message.channel.send("Rates updated!");
                    } else {
                        this.printErrorMessage(message, "An error occured while processing the rates. Did you submit the correct JSON file?")
                        return;
                    }
                }
            });
        }
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply(errorMessage);
    }
}