const { Command } = require('discord.js-commando');
const roles = require('../../lib/roles');

module.exports = class DeleteRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'deleterole',
            aliases: [
                'deleteroles'
            ],
            group: 'admin',
            guildOnly: true,
            memberName: 'deleterole',
            description: 'Deletes a role',
            details: 'You can provide more than one role to be deleted. To do so, just add them separated by a white space.',
            format: '<role> [anotherRole ...]',
            examples: ['!deleterole Wind', '!deleteroles Light Dark'],
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }

    hasPermission(msg) {
		if(this.client.options.selfbot) return true;
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
    }
    
    async run(message, args) {
        try{
        var guild = message.guild;
        if(guild != null){
            var bot = guild.me;
            if(args != 'undefined' && args != null) {
                var argsList = args.split(/\s+/);
                var rolesToDelete = [];

                for (var i = 0; i < argsList.length; i++){
                    var arg = argsList[i].toLowerCase();
                    if(arg in roles.data){
                            rolesToDelete.push(arg);
                    }else{
                        this.printErrorMessage(message, "This role does not exists.");
                        return;
                    }
                }

                roles.removeAll(rolesToDelete);

                this.printMessage(message, 'Role(s) deleted');

            } else {
                this.printErrorMessage(message, "You need to provide at least one argument.");
                return;
            }
        } else {
            this.printErrorMessage(message, "You can not delete a role here!");
            return;
        }
        } catch (e){
            console.log(e);
        }
    }

    async printMessage(originalMessage, newMessage) {
        await originalMessage.channel.send(newMessage);
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply(errorMessage);
    }
}