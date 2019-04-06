const { Command } = require('discord.js-commando');
const roles = require('../../lib/roles');

module.exports = class RemoveRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'removerole',
            aliases: [
                'removeroles'
            ],
            group: 'role',
            guildOnly: true,
            memberName: 'removerole',
            description: 'Removes a role',
            details: 'You can provide more than one role to be removed. To do so, just add them separated by a white space.',
            format: '<role> [anotherRole ...]',
            examples: ['!removeRole Wind', '!removeRoles Light Dark'],
            argsType: "multiple",
            throttling: {
				usages: 5,
				duration: 10
            }
        });
    }
    
    async run(message, args) {
        var guild = message.guild;
        if(guild != null){
            var bot = guild.me;
            if(bot.hasPermission('MANAGE_ROLES')){
                if(args.length > 0) {

                    var guildMember = message.guild.member(message.author.id);
                    
                    var rolesGuild = roles.get(guild.id);
                    if (rolesGuild == 'undefined' || rolesGuild == null) rolesGuild = [];
                    
                    var rolesError = [];

                    for (var i = 0; i < args.length; i++){
                        var arg = args[i];
                        if(rolesGuild.indexOf(arg) > -1){
                            var role = message.guild.roles.find(role => role.name === arg);
                            if (role != null) {
                                if(guildMember.roles.find(memberRole => memberRole.id === role.id) != null){
                                    if(bot.highestRole.comparePositionTo(role) > 0) {
                                        guildMember.removeRole(role).catch((e) => {
                                            rolesError.push(arg + " (Unknown error)");
                                            console.log(e);
                                        });
                                    } else {
                                        rolesError.push(role.name + " (Higher than bot)");
                                    }
                                } else {
                                    rolesError.push(arg + " (Do not have it)");
                                }
                            } else {
                                rolesError.push(arg + " (Not found)");
                            }
                        }else{
                            rolesError.push(arg + " (Not found)");
                        }
                    }

                    if (rolesError.length == 0){
                        this.printMessage(message, 'Role(s) removed');
                    } else {
                        this.printErrorMessage(message, "some role(s) could not be removed: " + rolesError.join(", ") + "");
                    }
                    
                } else {
                    this.printErrorMessage(message, "you need to provide at least one argument");
                }
            } else {
                this.printErrorMessage(message, "sorry, I do not have the permission to remove roles here...");
            }
        } else {
            this.printErrorMessage(message, "you can not remove a role here!");
        }
    }

    async printMessage(originalMessage, newMessage) {
        await originalMessage.channel.send(newMessage);
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply(errorMessage);
    }
}