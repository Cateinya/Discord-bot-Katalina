import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types.js";
import { getEmote, getGlobalEmoteList, getServerAliasList, getServerEmoteList } from "../../utils/emotemanager.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("emote")
        .setDescription("Sends the specified emote in the chat")
        .addStringOption(option => {
            return option
                .setName("name")
                .setDescription("The name of the emote (or an alias)")
                .setRequired(true)
                .setAutocomplete(true);
        }),
    autocomplete: async (interaction) => {
        try {
            const focusedValue = interaction.options.getFocused();
            const choices: { name: string, value: string }[] = [];

            let emoteList = getGlobalEmoteList()
                .filter(emote => !focusedValue || emote.includes(focusedValue))
                .slice(0, 25);

            const server_id = interaction.guild?.id;
            if (server_id) {
                emoteList.push(...getServerEmoteList(server_id)
                    .filter(emote => !focusedValue || emote.includes(focusedValue))
                    .slice(0, 25));

                const aliasesServer = getServerAliasList(server_id);
                if (aliasesServer) {
                    emoteList.push(...Object.keys(aliasesServer)
                        .filter(alias => !focusedValue || alias.includes(focusedValue)).slice(0, 25));
                }
            }

            emoteList = emoteList.sort().slice(0, 25);

            for (let i = 0; i < emoteList.length; i++) {
                const emote = emoteList[i];
                choices.push({ name: emote, value: emote });
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

            let emoteName = interaction.options.getString("name");
            if (!emoteName) return interaction.reply({ content: "You need to provide an emote name (or an alias)!", ephemeral: true });

            const server_id = interaction.guild?.id;
            if (server_id) {
                const aliasesServer = getServerAliasList(server_id);
                if (aliasesServer && aliasesServer[emoteName]) emoteName = aliasesServer[emoteName];
            }

            const emote = getEmote(emoteName, interaction.guild?.id);
            if (!emote) return interaction.reply({ content: "This emote (or alias) does not exist!", ephemeral: true });

            return interaction.reply({ files: [emote.location] });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: "Something went wrong...", ephemeral: true });
        }
    },
    cooldown: 10
};

export default command;