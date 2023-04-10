import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types.js";
import {
    addServerRatesInfo, createRatesDescription, createServerRatesList,
    deleteServerRatesInfo, getRatesData, getServerRatesInfoList
} from "../../utils/ratesmanager.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("rates_info")
        .setDescription("Adds or deletes rates info")
        .addSubcommand(subcommand => {
            return subcommand
                .setName("add")
                .setDescription("Adds rates info")
                .addStringOption(option => {
                    return option
                        .setName("rates")
                        .setDescription("Rates to add info for")
                        .setRequired(true)
                        .setAutocomplete(true);
                })
                .addStringOption(option => {
                    return option
                        .setName("info")
                        .setDescription("Info to add")
                        .setRequired(true);
                });
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName("update")
                .setDescription("Updates rates info")
                .addStringOption(option => {
                    return option
                        .setName("rates")
                        .setDescription("Rates to update info")
                        .setRequired(true)
                        .setAutocomplete(true);
                })
                .addStringOption(option => {
                    return option
                        .setName("info")
                        .setDescription("Info to update")
                        .setRequired(true);
                });
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName("delete")
                .setDescription("Deletes rates info")
                .addStringOption(option => {
                    return option
                        .setName("rates")
                        .setDescription("Rates to delete info")
                        .setRequired(true)
                        .setAutocomplete(true);
                });
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
                const serverRatesList = createServerRatesList(server_id);

                const ratesFiltered = Object.keys(serverRatesList).sort().reverse().filter(ratesID =>
                    !focusedValue
                    || ratesID.includes(focusedValue)
                    || serverRatesList[ratesID].aliases?.some(alias => alias.includes(focusedValue))
                    || serverRatesList[ratesID].info?.includes(focusedValue))
                    .slice(0, 25);

                for (let i = 0; i < ratesFiltered.length; i++) {
                    const ratesID = ratesFiltered[i];
                    choices.push({
                        name: createRatesDescription(ratesID, serverRatesList[ratesID].aliases, serverRatesList[ratesID].info),
                        value: ratesID
                    });
                }
            } else if (commandName == "update") {
                const serverRatesList = createServerRatesList(server_id);
                if (serverRatesList) {

                    const ratesFiltered = Object.keys(serverRatesList).sort().reverse().filter(ratesID =>
                        (serverRatesList[ratesID].info)
                        && (!focusedValue
                            || ratesID.includes(focusedValue)
                            || serverRatesList[ratesID].aliases?.some(alias => alias.includes(focusedValue))
                            || serverRatesList[ratesID].info?.includes(focusedValue)))
                        .slice(0, 25);

                    for (let i = 0; i < ratesFiltered.length; i++) {
                        const ratesID = ratesFiltered[i];
                        choices.push({
                            name: createRatesDescription(ratesID, serverRatesList[ratesID].aliases, serverRatesList[ratesID].info),
                            value: ratesID
                        });
                    }
                }
            } else if (commandName == "delete") {
                const infoServer = getServerRatesInfoList(server_id);
                if (infoServer) {
                    Object.keys(infoServer)
                        .filter(ratesID =>
                            !focusedValue
                            || ratesID.includes(focusedValue)
                            || infoServer[ratesID].includes(focusedValue))
                        .slice(0, 25)
                        .forEach(ratesID => {
                            choices.push({ name: `"${infoServer[ratesID]}" (ID: ${ratesID})`, value: ratesID });
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
            const ratesInfoServer = getServerRatesInfoList(server_id);

            const ratesID = interaction.options.getString("rates");
            if (!ratesID) return interaction.reply({ content: "You need to provide a rates ID!", ephemeral: true });

            if (commandName == "add") {
                if (!getRatesData(ratesID)) return interaction.reply({ content: "You need to provide a valid rates ID!", ephemeral: true });

                const info = interaction.options.getString("info");
                if (!info) return interaction.reply({ content: "You need to provide info!", ephemeral: true });

                if (ratesInfoServer && ratesInfoServer[ratesID]) return interaction.reply({ content: "These rates already have info!", ephemeral: true });

                addServerRatesInfo(server_id, ratesID, info);

                interaction.reply(`Info added: "${info}" (ID: ${ratesID})`);
            } else if (commandName == "update") {
                if (!getRatesData(ratesID)) return interaction.reply({ content: "You need to provide a valid rates ID!", ephemeral: true });

                const info = interaction.options.getString("info");
                if (!info) return interaction.reply({ content: "You need to provide info!", ephemeral: true });

                if (!ratesInfoServer || !ratesInfoServer[ratesID]) return interaction.reply({ content: "These rates do not have info!", ephemeral: true });

                const oldInfo = ratesInfoServer[ratesID];
                addServerRatesInfo(server_id, ratesID, info);

                interaction.reply(`Info updated: "${oldInfo}" -> "${info}" (ID: ${ratesID})`);
            } else if (commandName == "delete") {
                if (!ratesInfoServer || !ratesInfoServer[ratesID]) return interaction.reply({ content: "These rates do not have info!", ephemeral: true });

                const info = ratesInfoServer[ratesID];
                deleteServerRatesInfo(server_id, ratesID);

                interaction.reply(`Info deleted: "${info}" (ID: ${ratesID})`);
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