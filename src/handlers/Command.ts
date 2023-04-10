import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { existsSync } from "fs";
import { join } from "path";
import { color, findInDir } from "../utils/functions.js";
import { Command, SlashCommand } from "../types.js";

module.exports = (client: Client) => {
    const slashCommands: SlashCommandBuilder[] = [];
    const commands: Command[] = [];

    const slashCommandsDir = join(__dirname, "../slashCommands");
    const commandsDir = join(__dirname, "../commands");

    if (existsSync(slashCommandsDir)) {
        findInDir(slashCommandsDir, /\.js$/).forEach(file => {
            if (!file.endsWith(".js")) return;
            const command: SlashCommand = require(`${file}`).default;
            slashCommands.push(command.command);
            client.slashCommands.set(command.command.name, command);
        });
    }

    if (existsSync(commandsDir)) {
        findInDir(commandsDir, /\.js$/).forEach(file => {
            if (!file.endsWith(".js")) return;
            const command: Command = require(`${file}`).default;
            commands.push(command);
            client.commands.set(command.name, command);
        });
    }

    const rest = new REST({ version: "10" }).setToken(client.bot_token);

    rest.put(Routes.applicationCommands(client.client_id), {
        body: slashCommands.map(command => command.toJSON())
    })
        .then((data: any) => {
            console.log(color("text", `🔥 Successfully loaded ${color("variable", data.length)} slash command(s)`));
            console.log(color("text", `🔥 Successfully loaded ${color("variable", commands.length)} command(s)`));
        }).catch(e => {
            console.error(e);
        });
};