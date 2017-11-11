const { Command } = require('discord.js-commando');
const rng = require('../../lib/rng');

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            group: 'roll',
            memberName: 'roll',
            description: 'Performs a Premium draw.',
            details : 'Add "10" to roll a 10-part draw and/or "legfest" to draw under the legfest draw rates',
            examples: ['!roll', '!roll 10', '!roll legfest', '!roll 10 legfest '],
            argsCount: 2,
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var single = true;
        var legfest = false;
        
        for (var i = 0; i < args.length; i++){
            if (args[i] == 10) single = false;
            if (args[i] == 'legfest' || args[i] == 'lf') legfest = true;
        }

        var results = [];
        var loopend = ( 0, (single) ? 1 : 10 );
        for (var j = 0; j < loopend; j++ ){
            var result = rng.draw((j == 9), legfest);
            if(result.includes("SS Rare")) result = "<" + result + ">";
            results.push(result);
        }

        message.channel.send("```md\nYou got " + results.join(", ")+"\n```");
    }
}