import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types.js";
import { drawMultiple } from "../../utils/rng.js";
import {
    createRatesDescription, createServerRatesList, formatDrawResults, getLatestRatesID,
    getRatesData, getServerRatesAliasesList, getServerRatesInfoList
} from "../../utils/ratesmanager.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("spark")
        .setDescription("Performs a spark (300 Premium draws)")
        .addStringOption(option => {
            return option
                .setName("rates")
                .setDescription("ID (or alias) of a specific rate-up (default: the latest rates)")
                .setAutocomplete(true);
        }),
    autocomplete: async (interaction) => {
        try {
            const focusedValue = interaction.options.getFocused();
            const choices: { name: string, value: string }[] = [];
            const server_id = interaction.guild?.id;

            if (server_id) {
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
            }

            await interaction.respond(
                choices
            );
        } catch (error) {
            console.error(error);
        }
    },
    execute: interaction => {
        try {
            if (!interaction.isChatInputCommand()) return;

            let ratesAliases, info;
            let ratesID = "latest";
            const server_id = interaction.guild?.id;
            const ratesAliasesServer = (server_id) ? getServerRatesAliasesList(server_id) : undefined;
            const ratesInfoServer = (server_id) ? getServerRatesInfoList(server_id) : undefined;

            const id_or_alias = interaction.options.getString("rates");
            if (id_or_alias) {
                const id_regex = /([0-9]+)/g;
                if (id_regex.test(id_or_alias) && getRatesData(id_or_alias)) {
                    ratesID = id_or_alias;
                } else if (server_id) {
                    if (ratesAliasesServer && ratesAliasesServer[id_or_alias]) {
                        ratesID = ratesAliasesServer[id_or_alias];
                        ratesAliases = [id_or_alias];
                    }
                }
            }

            if (!ratesID || ratesID == "latest") {
                const latestID = getLatestRatesID();
                if (latestID) ratesID = latestID;
            }

            const draws = drawMultiple(ratesID, 300, true);
            if (!draws) return interaction.reply({ content: "Something went wrong...", ephemeral: true });

            if (ratesInfoServer && ratesInfoServer[ratesID]) info = ratesInfoServer[ratesID];
            if (!ratesAliases && ratesAliasesServer) {
                ratesAliases = Object.keys(ratesAliasesServer).filter(alias => ratesAliasesServer[alias] == ratesID);
            }

            const msg = formatDrawResults(draws, false, ratesID, ratesAliases, info);

            interaction.reply(msg);
        } catch (error) {
            console.error(error);
            interaction.reply({ content: "Something went wrong...", ephemeral: true });
        }
    },
    cooldown: 5
};

export default command;