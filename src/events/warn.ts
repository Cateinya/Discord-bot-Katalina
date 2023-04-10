import { BotEvent } from "../types.js";
import { color } from "../utils/functions.js";

const event: BotEvent = {
    name: "warn",
    once: false,
    execute: (args) => {
        console.warn(
            color("text", args)
        );
    }
};

export default event;