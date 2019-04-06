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
            examples: ['!spark', '!spark'],
            argsCount: 0,
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var weapons = [];
        var summons = [];
		// Would be possible to do all the tenth draws first and then all the 270 remaining but, in the 
		// spirit of doing the same as a real spark, let loop 30 times on a 10-draw
		for (var i = 0; i < SPARK_DRAW_COUNT / 10; i ++) {
			for (var j = 0; j < 10; j++ ){
				var draw = rng.draw(j == 9);
                var rarity = this.getRarity(draw);
                if (rarity >= SSR) {
                    if(this.isWeapon(draw)) {
                        weapons.push(this.createSSRDescription(draw, rarity));
                    } else {
                        summons.push(this.createSSRDescription(draw, rarity));
                    }
                }
			}
        }

        weapons.sort();
        summons.sort();

        var total = weapons.length + summons.length;
        
        var msg = "```ml\nYou Got " + total + " SSRs (" + (total/SPARK_DRAW_COUNT*100).toFixed(2) + "%):\n\n'Weapons': " + weapons.join(", ") + "\n\n'Summons': " + summons.join(", ") + "\n```";
        if (msg.length > 2000) {
            msg = msg.substr(0, 1992) + "...\n```";
        }

        message.channel.send(msg);
    }

    isWeapon(draw) {
        return draw.includes('(');
    }
	
	createSSRDescription(draw, rarity) {
		return draw.substring(8, draw.length).replace('(','("').replace(')','")');
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