const { Command } = require('discord.js-commando');
const rng = require('../../lib/rng');

module.exports = class RollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            group: 'roll',
            memberName: 'roll',
            description: 'Performs a Premium draw.',
            examples: ['!roll'],
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var result = rng.draw(false);
        if(result.includes("SS Rare")) result = "<" + result + ">"; 

        message.channel.send("```md\nYou got " + result.join(", ")+"\n```");
    }
}