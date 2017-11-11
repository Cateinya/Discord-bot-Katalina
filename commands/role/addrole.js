const { Command } = require('discord.js-commando');
const roles = require('../../lib/roles');

module.exports = class AddRoleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'addrole',
            aliases: [
                'addroles'
            ],
            group: 'role',
            guildOnly: true,
            memberName: 'addrole',
            description: 'Adds a role',
            details: 'You can provide more than one role to be added. To do so, just add them separated by a white space.',
            format: '<role> [anotherRole ...]',
            examples: ['!addrole Wind', '!addroles Light Dark'],
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
                if(args != 'undefined' && args != null) {
                    var argsList = args.split(/\s+/);
                    var guildMember = message.guild.member(message.author.id);
                    var rolesToAdd = [];

                    for (var i = 0; i < argsList.length; i++){
                        if(argsList[i].toLowerCase() in roles.data){
                            var arg = roles.get(argsList[i].toLowerCase());
                            var role = message.guild.roles.find('name', arg);
                            if (role != null) {
                                if(guildMember.roles.find('id', role.id) == null){
                                    if(bot.highestRole.comparePositionTo(role) > 0) {
                                        rolesToAdd.push(role);
                                    } else {
                                        this.printErrorMessage(message, 'Sorry, I can\' handle this role...');
                                        return;
                                    }
                                } else {
                                    this.printErrorMessage(message, 'You already have this role!');
                                    return;
                                }
                            } else {
                                this.printErrorMessage(message, 'Failed to add role(s)');
                                return;
                            }
                        }else{
                            this.printErrorMessage(message, "This role can not be added.");
                            return;
                        }
                    }

                    guildMember.addRoles(rolesToAdd).then((gm) => {
                        this.printMessage(message, 'Role(s) added');
                    }).catch((e) => {
                        this.printErrorMessage(message, 'Failed to add role(s)');
                        console.log(e);
                    });
                } else {
                    this.printErrorMessage(message, "You need to provide at least one argument.");
                    return;
                }
            } else {
                this.printErrorMessage(message, "Sorry, I don't have the permission to add / remove role(s)...");
                return;
            }
        } else {
            this.printErrorMessage(message, "You can not add a role here!");
            return;
        }
    }

    async printMessage(originalMessage, newMessage) {
        await originalMessage.channel.send(newMessage);
    }

    async printErrorMessage(originalMessage,errorMessage) {
        await originalMessage.reply(errorMessage);
    }
}