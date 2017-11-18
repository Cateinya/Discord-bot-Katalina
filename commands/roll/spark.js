const { Command } = require('discord.js-commando');
const rng = require('../../lib/rng');

const R = 1;
const SR = 2;
const SSR = 3;
const SPARK_DRAW_COUNT = 300;

module.exports = class RollCommand extends Command {

    constructor(client) {
        super(client, {
            name: 'spark',
            group: 'roll',
            memberName: 'spark',
            description: 'Performs a spark using 30 10-part draws.',
            details : 'Add "SSR" to filter the spark result to keep only the SSR draws',
            examples: ['!spark', '!spark SSR'],
            argsCount: 2,
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var minimumRarity = this.parseFilterLevel(args);

        var results = [];
        var SSRCount = 0;
		// Would be possible to do all the tenth draws first and then all the 270 remaining but, in the 
		// spirit of doing the same as a real spark, let loop 30 times on a 10-draw
		for (var i = 0; i < SPARK_DRAW_COUNT / 10; i ++) {
			for (var j = 0; j < 10; j++ ){
				var draw = rng.draw(j == 9, false);
                var rarity = this.getRarity(draw);
                if (rarity >= minimumRarity) {
                    results.push(this.createDescription(draw, rarity));
                    if (rarity == SSR) {
                        SSRCount++;
                    }
                }
			}
        }
        
        var msg = "```md\nYou got " + SSRCount + " SSRs (" + (SSRCount/SPARK_DRAW_COUNT*100).toFixed(2) + "%): " + results.join(", ")+"\n```";
        if (msg.length > 2000) {
            msg = msg.substr(0, 1992) + "...\n```";
        }

        message.channel.send(msg);
    }
	
	createDescription(draw, rarity) {
		return rarity == SSR ? "<" + draw + ">" : draw;
	}
	
	parseFilterLevel(args) {
		if (args.length > 0) {
			var filterArg = args[0];
			if (filterArg == 'SSR') {
				return SSR;
			}
		}
		
		// Default to no filter if there's no or bad argument
		return SR;
	}
    
    getRarity(draw) {
        if (draw.includes("SS Rare")) {
            return SSR;
        } else if (draw.includes("S Rare")) {
            return SR;
        } else {
            return R;
        }
    }
}