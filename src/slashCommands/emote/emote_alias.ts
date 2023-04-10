import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types.js";
import { addServerAlias, deleteServerAlias, getEmote, getGlobalEmoteList, getServerAliasList, getServerEmoteList } from "../../utils/emotemanager.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("emote_alias")
        .setDescription("Adds or deletes emote aliases")
        .addSubcommand(subcommand => {
            return subcommand
                .setName("add")
                .setDescription("Adds an emote alias")
                .addStringOption(option => {
                    return option
                        .setName("emote")
                        .setDescription("Emote to add an alias for")
                        .setRequired(true)
                        .setAutocomplete(true);
                })
                .addStringOption(option => {
                    return option
                        .setName("alias")
                        .setDescription("Alias to add")
                        .setRequired(true);
                });
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName("delete")
                .setDescription("Deletes an emote alias")
                .addStringOption(option => {
                    return option
                        .setName("alias")
                        .setDescription("Alias to delete")
                        .setRequired(true)
                        .setAutocomplete(true);
                });
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName("list")
                .setDescription("Lists all available emote aliases");
        })
        .setDMPermission(false),
    autocomplete: async (interaction) => {
        try {
            if (!interaction.guild) return;

            const commandName = interaction.options.getSubcommand();
            const focusedValue = interaction.options.getFocused();
            const server_id = interaction.guild.id;
            const choices: { name: string, value: string }[] = [];

            if (commandName == "add") {
                let emoteList = getGlobalEmoteList()
                    .filter(emote => !focusedValue || emote.includes(focusedValue))
                    .slice(0, 25);
                emoteList.push(...getServerEmoteList(server_id)
                    .filter(emote => !focusedValue || emote.includes(focusedValue))
                    .slice(0, 25));

                emoteList = emoteList.sort().slice(0, 25);

                for (let i = 0; i < emoteList.length; i++) {
                    const emote = emoteList[i];
                    choices.push({ name: emote, value: emote });
                }
            } else if (commandName == "delete") {
                const aliasesServer = getServerAliasList(server_id);
                if (aliasesServer) {
                    Object.keys(aliasesServer)
                        .filter(alias => !focusedValue || alias.includes(focusedValue))
                        .slice(0, 25)
                        .forEach(alias => {
                            choices.push({ name: `${alias} (emote: ${aliasesServer[alias]})`, value: alias });
                        });
                }
            }

            await interaction.respond(
                choices
            );
        } catch (error) {
            console.error(error);
        }
    },
    execute: async (interaction) => {
        try {
            if (!interaction.isChatInputCommand()) return;
            if (!interaction.guild) return;

            const commandName = interaction.options.getSubcommand();
            const server_id = interaction.guild.id;
            const aliasesServer = getServerAliasList(server_id);

            if (commandName == "list") {
                if (!aliasesServer || Object.keys(aliasesServer).length == 0) return interaction.reply({ content: "There are no available aliases!", ephemeral: true });

                try {
                    await interaction.deferReply({ ephemeral: true });

                    let reply = "List of all available aliases (and the associated emote):\n```";
                    Object.keys(aliasesServer).forEach(alias => {
                        const description = `alias (${aliasesServer[alias]})`;
                        if ((reply.length + 3 + description.length) < 2000) {
                            reply += description + ", ";
                        } else {
                            reply = reply.slice(0, -2) + "```";
                            interaction.followUp({ content: reply, ephemeral: true });
                            reply = "```" + description + ", ";
                        }
                    });
                    reply = reply.slice(0, -2) + "```";
                    return interaction.followUp({ content: reply, ephemeral: true });
                } catch (error) {
                    console.error(error);
                    return interaction.editReply({ content: "Something went wrong..." });
                }
            }

            const alias = interaction.options.getString("alias");
            if (!alias) return interaction.reply({ content: "You need to provide an alias!", ephemeral: true });

            if (commandName == "add") {
                const emoteName = interaction.options.getString("emote");
                if (!emoteName) return interaction.reply({ content: "You need to provide an emote name!", ephemeral: true });

                const emote = getEmote(emoteName, interaction.guild.id);
                if (!emote) return interaction.reply({ content: "You need to provide a valid emote!", ephemeral: true });

                if (aliasesServer && aliasesServer[alias]) return interaction.reply({ content: "This alias already exists!", ephemeral: true });

                if (getEmote(alias, server_id)) return interaction.reply({ content: "You cannot add this alias, an emote with this name already exists!", ephemeral: true });

                addServerAlias(server_id, alias, emote.name);

                interaction.reply(`Alias added: ${alias} (emote: ${emote.name})`);
            } else if (commandName == "delete") {
                if (!aliasesServer || !aliasesServer[alias]) return interaction.reply({ content: "This alias does not exist!", ephemeral: true });

                const emoteName = aliasesServer[alias];
                deleteServerAlias(server_id, alias);

                interaction.reply(`Alias deleted: ${alias} (emote: ${emoteName})`);
            } else {
                interaction.reply({ content: "Something went wrong...", ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            interaction.reply({ content: "Something went wrong...", ephemeral: true });
        }
    },
    cooldown: 10
};

export default command;