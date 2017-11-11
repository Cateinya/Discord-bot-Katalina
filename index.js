const Discord = require('discord.js');

const commando = require('discord.js-commando');
const client = new commando.Client();

const tokens = require('./tokens');

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();

const cleverbot = require('cleverbot.io');
var bot = new cleverbot(tokens['cleverbot']['user'],tokens['cleverbot']['key']);
bot.setNick("Katalina");

client
      .on('error', console.error)
	    .on('warn', console.warn)
	    .on('ready', () => {
		    console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
	    })
	    .on('disconnect', () => { console.warn('Disconnected!'); })
      .on('reconnecting', () => { console.warn('Reconnecting...'); })

      .on('guildMemberAdd', member => {
        member.guild.defaultChannel.send(`Welcome to the server, ${member}!`);
      })

      .on('guildMemberUpdate', (oldMember, newMember) => {
        if(newMember.displayName != oldMember.displayName){
          newMember.guild.defaultChannel.send(`${oldMember.displayName} is now ${newMember.displayName}`);
        }
      });

/*client.dispatcher
      .addInhibitor(message => {
        if (message.isMemberMentioned(client.user)){
          var botMention = `<@${client.user.id}>`;
          var text = message.content;
          var directMessage = false;

          if(text.startsWith(botMention)){
            directMessage = true;
            text = text.substr(text.indexOf(" ") + 1);
          }else{
            text = text.replace(botMention, client.user.username);
          }
          emitter.emit('request',text);
          emitter.once('response', function(response){
            if(directMessage){
              message.reply(response);
            }else{
              message.channel.send(response);
            }
          });
        
          return true;
        }
      });*/

client.registry
      .registerGroups([
          ['emote', 'Emote'],
          ['alias', 'Alias'],
          ['role', 'Role'],
          ['roll', 'Roll'],
          ['admin', 'Admin']
      ])
      .registerDefaultTypes()
      .registerDefaultGroups()
      .registerDefaultCommands({prefix:false, eval_:false, commandState:false})
      .registerCommandsIn(__dirname + "/commands");


client.login(tokens['discord']);

process.on('unhandledRejection', console.error);

bot.create(function (err, response) {
	emitter.on('request', function(line) {
		bot.ask(line, function (err, response) {
			if (err) throw response;
			emitter.emit('response',response);
		});
	}).on('close',function(){
		process.exit(0);
	});
});