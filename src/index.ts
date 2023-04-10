import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Command, SlashCommand } from "./types.js";
import { readdirSync } from "fs";
import { join } from "path";
import config from "./config.json";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.client_id = config.client_id;
client.bot_token = config.token;
client.slashCommands = new Collection<string, SlashCommand>();
client.commands = new Collection<string, Command>();
client.cooldowns = new Collection<string, number>();

const handlersDir = join(__dirname, "./handlers");
readdirSync(handlersDir).forEach(handler => {
    require(`${handlersDir}/${handler}`)(client);
});

client.login(config.token);

process.on("unhandledRejection", error => {
    console.error(error);
});