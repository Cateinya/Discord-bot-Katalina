import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { getThemeColor } from "../../utils/functions.js";
import { SlashCommand } from "../../types.js";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the bot's ping")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    execute: async interaction => {
        const sent = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription("Pinging...")
            ],
            fetchReply: true
        });
        interaction.editReply({
            content: "",
            embeds: [
                new EmbedBuilder()
                    .setTitle("Ping!")
                    .setDescription(`🏓 Pong! \n 📡 Websocket heartbeat: ${interaction.client.ws.ping}ms \n 📡 Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`)
                    .setColor(getThemeColor("text"))
            ]
        });
    },
    cooldown: 10
};

export default command;