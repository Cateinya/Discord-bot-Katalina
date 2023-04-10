import { BotEvent } from "../types.js";
import { color } from "../utils/functions.js";

const event: BotEvent = {
    name: "reconnecting",
    once: false,
    execute: () => {
        console.warn(
            color("text", "Reconnecting...")
        );
    }
};

export default event;