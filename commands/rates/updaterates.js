const { Command } = require('discord.js-commando');
var request = require('request');
var curlToJson = require('curl-to-json');
const rateParser = require('../../lib/rateparser');
const ratesData = require('../../lib/ratesdata');

module.exports = class UpdateRatesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'updaterates',
            aliases: [
                'updaterate'
            ],
            group: 'rates',
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
        var fileURL;

        if (message.attachments.size > 0){
            fileURL = message.attachments.first().url;
        }
        else if (arg){
            try{
                fileURL = curlToJson(arg);
            } catch (err) {
                this.printErrorMessage(message, "an error occured while retrieving the cURL. Did you submit a correct one?");
            }
            
        } else {
            this.printErrorMessage(message, "you need to either provide an attachment or an URL!");
            return;
        }

        if (fileURL != 'undefined' && fileURL){
            request.get(fileURL, function(error, response, body) {
                if(error){
                    message.reply("an error ocurred while retrieving the rates. Did you submit the correct URL or file?");
                } else {
                    var rawRates = JSON.parse(body);
                    var rawRatesID = rawRates['current_page_gacha_id'];
                    var tempRatesData = ratesData.data[rawRatesID];
                    if (tempRatesData == 'undefined' || tempRatesData == null) {
                        var parsedRates = rateParser.parse(rawRates);
                        if (parsedRates){
                            ratesData.set(rawRatesID, parsedRates);
                            message.channel.send("Rates updated! (ID="+ rawRatesID+")");

                        } else {
                            message.reply("an error ocurred while parsing the rates. Did you submit the correct URL or file?");
                        }
                    } else {
                        message.reply("these rates (ID="+ rawRatesID+") have already been submitted");
                    }
                }
            });
        }
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply(errorMessage);
    }
}