import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types.js";
import { createRatesDescription, createServerRatesList } from "../../utils/ratesmanager.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("rates_list")
        .setDescription("Lists the available rates")
        .addBooleanOption(option => {
            return option
                .setName("all")
                .setDescription("Whether to return all rates or only the last 10 (default: False -> the last 10)");
        }),
    execute: async (interaction) => {
        try {
            if (!interaction.isChatInputCommand()) return;

            await interaction.deferReply({ ephemeral: true });

            const server_id = interaction.guild?.id;

            const ratesList = createServerRatesList(server_id);

            if (!ratesList || Object.keys(ratesList).length == 0) return interaction.editReply({ content: "There are no available rates!" });

            const list_all = interaction.options.getBoolean("all");

            let reply = "List of " + (list_all ? "all" : "the last 10") + " available rates:\n```";

            Object.keys(ratesList).sort().reverse()
                .slice(0, (list_all ? undefined : 10)).forEach(ratesID => {
                    const ratesDescription = createRatesDescription(ratesID, ratesList[ratesID].aliases, ratesList[ratesID].info);

                    if ((reply.length + 3 + ratesDescription.length) < 2000) {
                        reply += ratesDescription + "\n";
                    } else {
                        reply = reply.slice(0, -1) + "```";
                        interaction.followUp({ content: reply, ephemeral: true });
                        reply = "```" + ratesDescription + "\n";
                    }
                });

            reply = reply.slice(0, -1) + "```";
            interaction.followUp({ content: reply, ephemeral: true });
        } catch (error) {
            console.error(error);
            interaction.editReply({ content: "Something went wrong..." });
        }
    },
    cooldown: 10
};

export default command;