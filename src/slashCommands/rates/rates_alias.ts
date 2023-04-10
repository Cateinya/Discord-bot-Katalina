import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types.js";
import {
    addServerRatesAlias, createRatesDescription, createServerRatesList, deleteServerRatesAlias,
    getRatesData, getServerRatesAliasesList, getServerRatesInfoList
} from "../../utils/ratesmanager.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("rates_alias")
        .setDescription("Adds or deletes rates aliases")
        .addSubcommand(subcommand => {
            return subcommand
                .setName("add")
                .setDescription("Adds a rates alias")
                .addStringOption(option => {
                    return option
                        .setName("rates")
                        .setDescription("Rates to add an alias for")
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
                .setName("update")
                .setDescription("Updates a rates alias")
                .addStringOption(option => {
                    return option
                        .setName("rates")
                        .setDescription("Rates to add an alias for")
                        .setRequired(true)
                        .setAutocomplete(true);
                })
                .addStringOption(option => {
                    return option
                        .setName("alias")
                        .setDescription("Alias to update")
                        .setRequired(true)
                        .setAutocomplete(true);
                });
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName("delete")
                .setDescription("Deletes a rates alias")
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
                .setDescription("Lists all available rates aliases");
        })
        .setDMPermission(false),
    autocomplete: async (interaction) => {
        try {
            if (!interaction.guild) return;

            const commandName = interaction.options.getSubcommand();
            const focusedValueFull = interaction.options.getFocused(true);
            const focusedValue = focusedValueFull.value;
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
                if (focusedValueFull.name == "rates") {
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
                } else if (focusedValueFull.name == "alias") {
                    const aliasesServer = getServerRatesAliasesList(server_id);
                    if (aliasesServer) {
                        Object.keys(aliasesServer)
                            .filter(alias =>
                                !focusedValue
                                || alias.includes(focusedValue)
                                || aliasesServer[alias].includes(focusedValue))
                            .slice(0, 25)
                            .forEach(alias => {
                                choices.push({ name: `${alias} (current ID: ${aliasesServer[alias]})`, value: alias });
                            });
                    }
                }
            } else if (commandName == "delete") {
                const aliasesServer = getServerRatesAliasesList(server_id);
                if (aliasesServer) {
                    Object.keys(aliasesServer)
                        .filter(alias =>
                            !focusedValue
                            || alias.includes(focusedValue)
                            || aliasesServer[alias].includes(focusedValue))
                        .slice(0, 25)
                        .forEach(alias => {
                            choices.push({ name: `${alias} (ID: ${aliasesServer[alias]})`, value: alias });
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
            const aliasesServer = getServerRatesAliasesList(server_id);
            const ratesInfoServer = getServerRatesInfoList(server_id);

            if (commandName == "list") {
                if (!aliasesServer || Object.keys(aliasesServer).length == 0) return interaction.reply({ content: "There are no available aliases!", ephemeral: true });

                try {
                    await interaction.deferReply({ ephemeral: true });

                    let reply = "List of all available aliases (and the associated rates):\n```";
                    Object.keys(aliasesServer).forEach(alias => {
                        const description = '"' + [alias] + '" - '
                            + ((ratesInfoServer && ratesInfoServer[alias]) ? '"' + ratesInfoServer[alias] + '" - ' : "")
                            + aliasesServer[alias];
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
                const ratesID = interaction.options.getString("rates");
                if (!ratesID) return interaction.reply({ content: "You need to provide a rates ID!", ephemeral: true });

                if (!getRatesData(ratesID)) return interaction.reply({ content: "You need to provide a valid rates ID!", ephemeral: true });

                if (aliasesServer && aliasesServer[alias]) return interaction.reply({ content: "This alias already exists!", ephemeral: true });

                if (getRatesData(alias)) return interaction.reply({ content: "You cannot add this alias, rates with this name already exist!", ephemeral: true });

                addServerRatesAlias(server_id, alias, ratesID);

                interaction.reply(`Alias added: ${alias} (ID: ${ratesID})`);
            } else if (commandName == "update") {
                const ratesID = interaction.options.getString("rates");
                if (!ratesID) return interaction.reply({ content: "You need to provide a rates ID!", ephemeral: true });

                if (!getRatesData(ratesID)) return interaction.reply({ content: "You need to provide a valid rates ID!", ephemeral: true });

                if (!aliasesServer || !aliasesServer[alias]) return interaction.reply({ content: "This alias does not exist!", ephemeral: true });

                if (getRatesData(alias)) return interaction.reply({ content: "You cannot use this alias, rates with this name already exist!", ephemeral: true });

                const oldRatesID = aliasesServer[alias];
                addServerRatesAlias(server_id, alias, ratesID);

                interaction.reply(`Alias updated: ${alias} (ID: ${oldRatesID} -> ${ratesID})`);
            } else if (commandName == "delete") {
                if (!aliasesServer || !aliasesServer[alias]) return interaction.reply({ content: "This alias does not exist!", ephemeral: true });

                const ratesID = aliasesServer[alias];
                deleteServerRatesAlias(server_id, alias);

                interaction.reply(`Alias deleted: ${alias} (ID: ${ratesID})`);
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