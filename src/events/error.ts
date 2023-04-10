import { BotEvent } from "../types.js";
import { color } from "../utils/functions.js";

const event: BotEvent = {
    name: "error",
    once: false,
    execute: (args) => {
        console.error(
            color("error", args)
        );
    }
};

export default event;