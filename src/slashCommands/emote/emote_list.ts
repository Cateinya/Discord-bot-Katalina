import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types.js";
import { getGlobalEmoteList, getServerAliasList, getServerEmoteList } from "../../utils/emotemanager.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("emote_list")
        .setDescription("Lists the available emotes"),
    execute: async (interaction) => {
        try {
            await interaction.deferReply({ ephemeral: true });
            let globalReply: string, serverReply: string, aliasReply: string;
            let replied = false;

            const globalEmoteList = getGlobalEmoteList();
            if (globalEmoteList.length > 0) {
                replied = true;

                globalReply = "List of all available global emotes:\n```";
                globalEmoteList.forEach(emote => {
                    if ((globalReply.length + 3 + emote.length) < 2000) {
                        globalReply += emote + ", ";
                    } else {
                        globalReply = globalReply.slice(0, -2) + "```";
                        interaction.followUp({ content: globalReply, ephemeral: true });
                        globalReply = "```" + emote + ", ";
                    }
                });
                globalReply = globalReply.slice(0, -2) + "```";
                interaction.followUp({ content: globalReply, ephemeral: true });
            }

            if (interaction.guild) {
                const server_id = interaction.guild.id;

                const serverEmoteList = getServerEmoteList(server_id);
                if (serverEmoteList.length > 0) {
                    replied = true;

                    serverReply = "List of all available server emotes:\n```";
                    serverEmoteList.forEach(emote => {
                        if ((serverReply.length + 3 + emote.length) < 2000) {
                            serverReply += emote + ", ";
                        } else {
                            serverReply = serverReply.slice(0, -2) + "```";
                            interaction.followUp({ content: serverReply, ephemeral: true });
                            serverReply = "```" + emote + ", ";
                        }
                    });
                    serverReply = serverReply.slice(0, -2) + "```";
                    interaction.followUp({ content: serverReply, ephemeral: true });
                }

                const aliasesServer = getServerAliasList(server_id);
                if (aliasesServer && Object.keys(aliasesServer).length > 0) {
                    replied = true;

                    aliasReply = "List of all available aliases (and the associated emote):\n```";
                    Object.keys(aliasesServer).forEach(alias => {
                        if (aliasReply.length + 5 + alias.length + aliasesServer[alias].length < 2000) {
                            aliasReply += alias + " (" + aliasesServer[alias] + "), ";
                        } else {
                            aliasReply = aliasReply.slice(0, -2) + "```";
                            interaction.followUp({ content: aliasReply, ephemeral: true });
                            aliasReply = "```" + alias + " (" + aliasesServer[alias] + "), ";
                        }
                    });
                    aliasReply = aliasReply.slice(0, -2) + "```";
                    interaction.followUp({ content: aliasReply, ephemeral: true });
                }
            }

            if (!replied) interaction.editReply({ content: "There are no available emotes!" });
        } catch (error) {
            console.error(error);
            interaction.editReply({ content: "Something went wrong..." });
        }
    },
    cooldown: 10
};

export default command;