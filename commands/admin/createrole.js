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
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }

    hasPermission(msg) {
		if(this.client.options.selfbot) return true;
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
    }
    
    async run(message, args) {
        try{
            var guild = message.guild;
            if(guild != null){
                var bot = guild.me;
                if(args.length > 0) {

                    var rolesGuild = roles.get(guild.id);
                    if (rolesGuild == 'undefined' || rolesGuild == null) rolesGuild = [];

                    var rolesError = [];

                    for (var i = 0; i < args.length; i++){
                        var arg = args[i];
                        if(rolesGuild.indexOf(arg) == -1){
                            
                            var role = message.guild.roles.find(role => role.name === arg);
                            if (role != null) {
                                if(bot.highestRole.comparePositionTo(role) > 0) {
                                    rolesGuild.push(role.name);
                                } else {
                                    rolesError.push(role.name + " (Higher than bot)");
                                }
                            } else {
                                rolesError.push(arg + " (Not found)");
                            }
                        }else{
                            rolesError.push(arg + " (Already exists)");
                        }
                    }

                    roles.set(guild.id, rolesGuild);

                    if (rolesError.length == 0){
                        this.printMessage(message, 'Role(s) created');
                    } else {
                        this.printErrorMessage(message, "some role(s) could not be created: " + rolesError.join(", "));
                    }

                } else {
                    this.printErrorMessage(message, "you need to provide at least one argument");
                }
            } else {
                this.printErrorMessage(message, "you can not create a role here!");
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