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
                        if(rolesGuild.indexOf(arg) > -1){
                            rolesGuild.splice( rolesGuild.indexOf(arg), 1 );
                        }else{
                            rolesError.push(arg + " (Not found)");
                        }
                    }

                    roles.set(guild.id, rolesGuild);

                    if (rolesError.length == 0){
                        this.printMessage(message, 'Role(s) deleted');
                    } else {
                        this.printErrorMessage(message, "some role(s) could not be deleted: " + rolesError.join(", "));
                    }

                } else {
                    this.printErrorMessage(message, "you need to provide at least one argument");
                }
            } else {
                this.printErrorMessage(message, "you can not delete a role here!");
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