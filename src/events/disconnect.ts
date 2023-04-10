import { BotEvent } from "../types.js";
import { color } from "../utils/functions.js";

const event: BotEvent = {
    name: "disconnect",
    once: false,
    execute: () => {
        console.warn(
            color("text", "Disconnected!")
        );
    }
};

export default event;