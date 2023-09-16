import { join, sep } from "path";
import { color, findInDir } from "./functions.js";
import { aliases } from "./dataobject.js";
import { existsSync } from "fs";

const imageLocation = join(__dirname, "../../lib/images/");

declare class Emote {
    name: string;
    location: string;
}

let globalEmotes: { [key: string]: Emote };
let serverEmotes: { [key: string]: { [key: string]: Emote } };

function initEmoteList() {
    globalEmotes = {};
    serverEmotes = {};

    let serverEmoteCount = 0;

    // RexExp : /lib/images/([^/])/
    const filterServerEmote = new RegExp(`\\${sep}lib\\${sep}images\\${sep}([^\\${sep}]+)\\${sep}`);

    if (!existsSync(imageLocation)) {
        console.error(`[initEmoteList] Cannot find directory "${imageLocation}"`);
        return;
    }
    const fileList = findInDir(imageLocation, /\.png$/);

    fileList.forEach(file => {
        const emote = { name: file.substring(file.lastIndexOf(sep) + 1, file.lastIndexOf(".")), location: file };
        const match = filterServerEmote.exec(emote.location);
        if (match) {
            const server_id = match[1];
            if (!serverEmotes[server_id]) serverEmotes[server_id] = {};

            serverEmotes[server_id][emote.name] = emote;
            serverEmoteCount++;
        } else {
            globalEmotes[emote.name] = emote;
        }
    });

    console.log(color("text", `🤩 Successfully loaded ${color("variable", Object.keys(globalEmotes).length)} global emote(s)`));
    console.log(color("text", `🤩 Successfully loaded ${color("variable", serverEmoteCount)} server emote(s)`));
}

initEmoteList();

export function reloadEmoteList() {
    initEmoteList();
}

export function getGlobalEmoteList() {
    return Object.keys(globalEmotes).sort();
}

export function getServerEmoteList(server_id: string) {
    return (serverEmotes[server_id]) ? Object.keys(serverEmotes[server_id])?.sort() : [];
}

export function getEmote(emoteName: string, server_id: string | undefined) {
    let emote;

    emote = globalEmotes[emoteName];
    if (emote) {
        return emote;
    } else if (server_id) {
        if (serverEmotes[server_id]) {
            emote = serverEmotes[server_id][emoteName];
            if (emote) return emote;
        }
    }

    return;
}

export function getServerAliasList(server_id: string) {
    return aliases.get(server_id);
}

export function addServerAlias(server_id: string, alias: string, emote: string) {
    const serverAliases = aliases.get(server_id);
    if (!serverAliases) {
        const newServerAliases: { [key: string]: any } = {};
        newServerAliases[alias] = emote;

        // Save modification
        aliases.set(server_id, newServerAliases);
    } else {
        serverAliases[alias] = emote;

        // Save modification
        aliases.save();
    }
}

export function deleteServerAlias(server_id: string, alias: string) {
    const serverAliases = aliases.get(server_id);
    if (serverAliases && serverAliases[alias]) {
        delete serverAliases[alias];

        // Save modification
        aliases.save();
    }
}

export interface ServerEmoteAliases {
    [key: string]: string;
}