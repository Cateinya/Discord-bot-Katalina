import { DataObject, ratesAliases, ratesData, ratesInfo } from "./dataobject.js";

/** DRAWS **/

export function formatDrawResults(draws: Draws, show_rarity: boolean, ratesID: string, aliases: string[] | undefined, info: string | undefined) {
    const weapons = [];
    const noncharacter_weapons = [];
    const summons = [];

    for (const weapon of draws["weapons"]) {
        weapons.push(createDrawDescription(weapon, show_rarity));
    }

    for (const noncharacter_weapon of draws["noncharacter_weapons"]) {
        noncharacter_weapons.push(createDrawDescription(noncharacter_weapon, show_rarity));
    }

    for (const summon of draws["summons"]) {
        summons.push(createDrawDescription(summon, show_rarity));
    }

    weapons.sort();
    noncharacter_weapons.sort();
    summons.sort();

    let msg = "```ml\nYou Got" + (
        (draws["total_draws"] > 10) ?
            ` ${draws["total_ssr"]} SSRs (${(draws["total_ssr"] / draws["total_draws"] * 100).toFixed(2)}% on ${draws["total_draws"]} draws):`
            : ":"
    );

    msg += (weapons.length > 0) ? "\n\n'Weapons': " + weapons.join(", ") : "";

    msg += (noncharacter_weapons.length > 0) ? "\n\n'Non_Character_Weapons': " + noncharacter_weapons.join(", ") : "";

    msg += (summons.length > 0) ? "\n\n'Summons': " + summons.join(", ") : "";

    msg += "\n\n(on rates: " + createRatesDescription(ratesID, aliases, info) + ")";

    msg += "\n```";

    // quick fix if length of message > 2000 characters (could be done better)
    if (msg.length > 2000) {
        msg = msg.slice(0, 1992) + "...\n```";
    }

    return msg;
}

export function createDrawDescription(item: NonCharacterWeapon | CharacterWeapon | Summon, show_rarity: boolean) {
    const rarity = (show_rarity) ? item["rarity"] + " " : "";
    const season_message = (isSummon(item) && item["season_message"]) ? " " + item["season_message"] : "";
    const rateUp = (item["incidence"]) ? " ↑" : "";
    const dupes = (item["draw_count"] && item["draw_count"] > 1) ? " x" + item["draw_count"] : "";

    return (isCharacterWeapon(item)) ?
        rarity + item["character_name"] + season_message + rateUp + " (\"" + item["name"] + "\")" + dupes
        :
        rarity + "\"" + item["name"] + season_message + "\"" + rateUp + dupes;
}

export function createRatesDescription(ratesID: string, aliases: string[] | undefined, info: string | undefined) {
    const alias = (aliases && aliases.length > 0) ? " - alias: " + aliases.join(", ") : "";
    const infoDesc = (info) ? ' - "' + info + '"' : "";

    return ratesID + infoDesc + alias;
}

export function createServerRatesList(server_id: string | undefined) {
    const ratesServer: { [key: string]: { aliases?: string[] | undefined, info?: string | undefined } } = {};

    Object.keys(ratesData.data).forEach(ratesID => {
        if (!ratesServer[ratesID]) ratesServer[ratesID] = {};
    });

    if (server_id) {
        const ratesAliasesServer = ratesAliases.get(server_id);
        if (ratesAliasesServer) {
            Object.keys(ratesAliasesServer).forEach(alias => {
                const ratesID = ratesAliasesServer[alias];
                if (ratesServer[ratesID]) {
                    if (!ratesServer[ratesID].aliases) ratesServer[ratesID].aliases = [alias];
                    else ratesServer[ratesID].aliases?.push(alias);
                }
            });
        }

        const ratesInfoServer = ratesInfo.get(server_id);
        if (ratesInfoServer) {
            Object.keys(ratesInfoServer).forEach(ratesID => {
                if (ratesServer[ratesID]) {
                    ratesServer[ratesID].info = ratesInfoServer[ratesID];
                }
            });
        }
    }

    return ratesServer;
}

/** RATES **/

const parseItemList = <T extends CharacterWeapon | NonCharacterWeapon | Summon>(rate_list: { [key: string]: any }): ItemSubList<T> => {
    const item_count = rate_list["item"].length;
    const item_list: ItemSubList<T> = {};

    for (let j = 0; j < item_count; j++) {
        const item = rate_list["item"][j];
        if (!item_list[item["drop_rate"]]) {
            item_list[item["drop_rate"]] = {
                "list": [],
                "count": 0,
                "total_rate": 0
            };
        }

        const cleaned_item = {
            "name": item["name"],
            "attribute": item["attribute"]
        } as T;

        if (isSummon(item)) {
            if (item["is_season"]) cleaned_item["season_message"] = item["season_message"];
        }

        if (isNonCharacterWeapon(item)) {
            if (item["kind"]) cleaned_item["kind"] = item["kind"];
        }

        if (isCharacterWeapon(item)) {
            if (item["kind"]) cleaned_item["kind"] = item["kind"];
            if (item["character_name"]) cleaned_item["character_name"] = item["character_name"];
        }

        if (item["incidence"]) cleaned_item["incidence"] = item["incidence"];

        item_list[item["drop_rate"]]["list"].push(cleaned_item);
    }

    for (const drop_rate in item_list) {
        item_list[drop_rate]["count"] = item_list[drop_rate]["list"].length;
        item_list[drop_rate]["total_rate"] = item_list[drop_rate]["list"].length * parseFloat(drop_rate) * 1000;
    }

    return item_list;
};

export function parseJsonRates(rawRates: { [key: string]: any }) {
    try {
        if (rawRates["ratio"].length == 3) {
            const tempRates: { [key: string]: Rarity } = {};

            const category_count = rawRates["appear"].length;

            for (let i = 0; i < category_count; i++) {
                const category_name: string = rawRates["appear"][i]["category_name"];
                // Cygames...
                const rarity = 4 - rawRates["appear"][i]["rarity"];
                const rarity_name: string = rawRates["ratio"][rarity]["rare"];

                if (rarity_name != "SS Rare" && rarity_name != "S Rare" && rarity_name != "Rare") continue;
                if (category_name != "Character Weapons" && category_name != "Non-Character Weapons" && category_name != "Summon") continue;

                let rarity_rates = tempRates[rarity_name];

                if (!rarity_rates) {
                    rarity_rates = { "drop_rate": parseFloat(rawRates["ratio"][rarity]["ratio"]) / 100.0 };
                    tempRates[rarity_name] = rarity_rates;
                }

                if (category_name == "Character Weapons") rarity_rates[category_name] = parseItemList<CharacterWeapon>(rawRates["appear"][i]);
                else if (category_name == "Non-Character Weapons") rarity_rates[category_name] = parseItemList<NonCharacterWeapon>(rawRates["appear"][i]);
                else if (category_name == "Summon") rarity_rates[category_name] = parseItemList<Summon>(rawRates["appear"][i]);
                else continue;
            }

            return tempRates as Rates;
        } else {
            return;
        }

    } catch (error) {
        console.error(error);
        return;
    }
}

/** DATA OBJECTS **/

function getServerRatesList<T extends ServerRatesAliases | ServerRatesInfo>(list: DataObject<T>, server_id: string) {
    return list.get(server_id);
}

function addServerRatesItem<T extends ServerRatesAliases | ServerRatesInfo>(list: DataObject<T>, server_id: string, key: string, value: string) {
    const serverList = list.get(server_id) as T;
    if (!serverList) {
        const newServerList: { [key: string]: string } = {};
        newServerList[key] = value;

        // Save modification
        list.set(server_id, newServerList as T);
    } else {
        serverList[key] = value;

        // Save modification
        list.save();
    }
}

function deleteServerRatesItem<T extends ServerRatesAliases | ServerRatesInfo>(list: DataObject<T>, server_id: string, key: string) {
    const serverList = list.get(server_id);
    if (serverList && serverList[key]) {
        delete serverList[key];

        // Save modification
        list.save();
    }
}

/* Rates aliases */

export function getServerRatesAliasesList(server_id: string) {
    return getServerRatesList(ratesAliases, server_id);
}

export function addServerRatesAlias(server_id: string, alias: string, ratesID: string) {
    addServerRatesItem(ratesAliases, server_id, alias, ratesID);
}

export function deleteServerRatesAlias(server_id: string, alias: string) {
    deleteServerRatesItem(ratesAliases, server_id, alias);
}

/* Rates info */

export function getServerRatesInfoList(server_id: string) {
    return getServerRatesList(ratesInfo, server_id);
}

export function addServerRatesInfo(server_id: string, ratesID: string, info: string) {
    addServerRatesItem(ratesInfo, server_id, ratesID, info);
}

export function deleteServerRatesInfo(server_id: string, ratesID: string) {
    deleteServerRatesItem(ratesInfo, server_id, ratesID);
}

/* Rates Data (not using the generic functions since they are saved globally and not per server) */

export function getRatesData(ratesID: string) {
    return ratesData.get(ratesID);
}

export function getLatestRatesID() {
    return Object.keys(ratesData.data)?.pop();
}

export function addRatesData(ratesID: string, data: Rates) {
    return ratesData.set(ratesID, data);
}

// No deleteRatesData (yet?)

export interface IIndexable {
    [key: string]: any;
}

export interface Item extends IIndexable {
    "name": string;
    "attribute": string;
    "incidence"?: string;

    // Used in draw results
    "category_name"?: string;
    "draw_count"?: number;
    "drop_rate"?: string;
    "rarity"?: string;
}

export interface Summon extends Item {
    "season_message"?: string;
}

export interface NonCharacterWeapon extends Item {
    "kind": string;
}

export interface CharacterWeapon extends Item {
    "kind": string;
    "character_name": string;
}

export function isSummon(item: Summon | NonCharacterWeapon | CharacterWeapon): item is Summon {
    return (item as Summon).kind == undefined;
}

export function isNonCharacterWeapon(item: Summon | NonCharacterWeapon | CharacterWeapon): item is NonCharacterWeapon {
    return (item as NonCharacterWeapon).kind !== undefined && (item as NonCharacterWeapon).character_name == undefined;
}

export function isCharacterWeapon(item: Summon | NonCharacterWeapon | CharacterWeapon): item is CharacterWeapon {
    return (item as CharacterWeapon).character_name !== undefined;
}

export enum CategoryType {
    character_weapons = "Character Weapons",
    noncharacter_weapons = "Non-Character Weapons",
    // TODO fix typo
    summons = "Summon"
}

export enum RarityType {
    ssr = "SS Rare",
    sr = "S Rare",
    r = "Rare"
}

export interface ItemSubList<T> {
    [key: string]: {
        "count": number;
        "total_rate": number;
        "list": T[];
    }
}

export interface Rarity {
    "drop_rate": number;
    "Character Weapons"?: ItemSubList<CharacterWeapon>;
    "Non-Character Weapons"?: ItemSubList<NonCharacterWeapon>;
    // TODO fix typo
    "Summon"?: ItemSubList<Summon>;
}

export interface Rates extends IIndexable {
    "SS Rare": Rarity;
    "S Rare": Rarity;
    "Rare": Rarity;
}

export interface Draws {
    "weapons": CharacterWeapon[];
    "noncharacter_weapons": NonCharacterWeapon[];
    "summons": Summon[];
    "total_draws": number;
    "total_ssr": number;
}

export interface ServerRatesInfo {
    [key: string]: string;
}

export interface ServerRatesAliases {
    [key: string]: string;
}