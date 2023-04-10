import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../types.js";
import { fetch } from "cross-fetch";
import { addRatesData, getRatesData, parseJsonRates } from "../../utils/ratesmanager.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("rates")
        .setDescription("Adds the premium draw rates using the attached document")
        .addSubcommand(subcommand => {
            return subcommand
                .setName("add")
                .setDescription("Adds a rates")
                .addNumberOption(option => {
                    return option
                        .setName("id")
                        .setDescription("ID of the rates (usually visible in the URL)")
                        .setRequired(true);
                })
                .addAttachmentOption(option => {
                    return option
                        .setName("rates")
                        .setDescription("Rates to add (in JSON format)")
                        .setRequired(true);
                });
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.AttachFiles),
    execute: async (interaction) => {
        try {
            if (!interaction.isChatInputCommand()) return;

            const commandName = interaction.options.getSubcommand();

            const rates_attachment = interaction.options.getAttachment("rates");
            if (!rates_attachment) return interaction.reply({ content: "You need to provide a rates attachment!", ephemeral: true });

            const rates_id = interaction.options.getNumber("id")?.toString();
            if (!rates_id) return interaction.reply({ content: "You need to provide a rates ID!", ephemeral: true });

            if (commandName == "add") {
                if (getRatesData(rates_id)) return interaction.reply({ content: "these rates have already been submitted!", ephemeral: true });

                let rates_json: JSON;
                try {
                    const response = await fetch(rates_attachment.url);
                    rates_json = await response.json();
                } catch (error) {
                    console.error(error);
                    return interaction.reply({ content: "An error occured while fetching the rates file...", ephemeral: true });
                }

                const rates_parsed = parseJsonRates(rates_json);

                if (!rates_parsed) return interaction.reply({ content: "An error occured while parsing the rates file...", ephemeral: true });

                addRatesData(rates_id, rates_parsed);

                interaction.reply(`Rates added! (ID: ${rates_id})`);
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