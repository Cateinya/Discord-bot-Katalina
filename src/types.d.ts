import { SlashCommandBuilder, CommandInteraction, Collection, PermissionResolvable, Message, AutocompleteInteraction } from "discord.js";

export interface SlashCommand {
    command: SlashCommandBuilder | any;
    execute: (interaction: CommandInteraction) => void;
    autocomplete?: (interaction: AutocompleteInteraction) => void;
    // in seconds
    cooldown?: number;
}

export interface Command {
    name: string;
    execute: (message: Message, args: Array<string>) => void;
    permissions: Array<PermissionResolvable>;
    aliases: Array<string>;
    // in seconds
    cooldown?: number;
}

interface GuildOptions {
    prefix: string;
}

export interface IGuild {
    guildID: string;
    options: GuildOptions;
    joinedAt: Date;
}

export type GuildOption = keyof GuildOptions
export interface BotEvent {
    name: string;
    once?: boolean | false;
    execute: (...args?) => void;
}

/*
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            CLIENT_ID: string;
            PREFIX: string;
            MONGO_URI: string;
            MONGO_DATABASE_NAME: string;
        }
    }
}
*/

declare module "discord.js" {
    export interface Client {
        client_id: string;
        bot_token: string;
        slashCommands: Collection<string, SlashCommand>;
        commands: Collection<string, Command>;
        cooldowns: Collection<string, number>;
    }
}