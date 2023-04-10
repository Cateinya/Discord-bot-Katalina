import { GuildMember } from "discord.js";
import { BotEvent } from "../types.js";

const event: BotEvent = {
    name: "guildMemberUpdate",
    execute: (oldMember: GuildMember, newMember: GuildMember) => {
        if (newMember.displayName != oldMember.displayName) {
            newMember.guild.systemChannel?.send(`${oldMember.displayName} is now ${newMember.displayName}`);
        }
    }
};

export default event;