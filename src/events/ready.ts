import { Client } from "discord.js";
import { BotEvent } from "../types.js";
import { color } from "../utils/functions.js";

const event: BotEvent = {
    name: "ready",
    once: true,
    execute: (client: Client) => {
        console.log(
            color("text", `💪 Logged in as ${color("variable", client.user?.tag)}`)
        );
    }
};

export default event;