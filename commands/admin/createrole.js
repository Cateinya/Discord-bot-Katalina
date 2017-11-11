const { Command } = require('discord.js-commando');
const roles = require('../../lib/roles');

module.exports = class CreateRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'createrole',
            aliases: [
                'createroles'
            ],
            group: 'admin',
            guildOnly: true,
            memberName: 'createrole',
            description: 'Creates a role',
            details: 'You can provide more than one role to be created. To do so, just add them separated by a white space.',
            format: '<role> [anotherRole ...]',
            examples: ['!createrole Wind', '!createroles Light Dark'],
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
                var rolesToCreate = {};

                for (var i = 0; i < argsList.length; i++){
                    var arg = argsList[i];
                    if(!roles.get(arg.toLowerCase())){
                        
                        var role = message.guild.roles.find('name', arg);
                        if (role != null) {
                            if(bot.highestRole.comparePositionTo(role) > 0) {
                                rolesToCreate[role.name.toLowerCase()] = role.name;
                            } else {
                                this.printErrorMessage(message, 'Sorry, I can\' handle this role...');
                                return;
                            }
                        } else {
                            this.printErrorMessage(message, 'Failed to create role(s) (check capitalization?).');
                            return;
                        }
                    }else{
                        this.printErrorMessage(message, "This role already exists.");
                        return;
                    }
                }

                roles.setAll(rolesToCreate);

                this.printMessage(message, 'Role(s) created');

            } else {
                this.printErrorMessage(message, "You need to provide at least one argument.");
                return;
            }
        } else {
            this.printErrorMessage(message, "You can not create a role here!");
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