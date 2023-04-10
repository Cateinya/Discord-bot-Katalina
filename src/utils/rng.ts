import {
    CategoryType, CharacterWeapon, Draws, Item, NonCharacterWeapon, RarityType,
    Summon, getRatesData, isCharacterWeapon, isNonCharacterWeapon, isSummon
} from "./ratesmanager.js";

function randomInt(low: number, high: number) {
    return Math.floor(Math.random() * (high - low) + low);
}

export function drawSingle(ratesID: string, tenth: boolean) {
    const rarity = rarityRoll(ratesID, tenth);
    if (!rarity) return;

    const itemSubList = firstPassRoll(ratesID, rarity);
    if (!itemSubList) return;

    const item = structuredClone(secondPassRoll(ratesID, rarity, itemSubList["category_name"], itemSubList["drop_rate"]));
    if (!item) return;

    item["rarity"] = rarity;
    item["category_name"] = itemSubList["category_name"];
    item["drop_rate"] = itemSubList["drop_rate"];

    return item;
}

export function drawMultiple(ratesID: string, draw_count: number, keep_ssr_only: boolean) {
    const draws: Draws = { "weapons": [] as CharacterWeapon[], "noncharacter_weapons": [] as NonCharacterWeapon[], "summons": [] as Summon[], "total_draws": draw_count, "total_ssr": 0 };
    // Would be possible to do all the tenth draws first and then all the remaining ones but, in the
    // spirit of doing the same as a real pull, let's loop through 10-draws
    for (let i = 0; i < draw_count; i++) {
        const draw = structuredClone(drawSingle(ratesID, (i + 1) % 10 == 0));
        if (!draw) return;

        draw["draw_count"] = 1;

        if (draw["rarity"] == RarityType.ssr) {
            draws["total_ssr"] += 1;
        }

        if (!keep_ssr_only || (keep_ssr_only && draw["rarity"] == RarityType.ssr)) {
            if (isSummon(draw)) {
                const existing_draw = draws["summons"].find(summon => summon.name == draw["name"]);
                if (existing_draw && existing_draw["draw_count"]) {
                    existing_draw["draw_count"] += 1;
                } else {
                    draws["summons"].push(draw);
                }
            } else if (isCharacterWeapon(draw)) {
                const existing_draw = draws["weapons"].find(weapon => weapon.name == draw["name"]);
                if (existing_draw && existing_draw["draw_count"]) {
                    existing_draw["draw_count"] += 1;
                } else {
                    draws["weapons"].push(draw);
                }
            } else if (isNonCharacterWeapon(draw)) {
                const existing_draw = draws["noncharacter_weapons"].find(weapon => weapon.name == draw["name"]);
                if (existing_draw && existing_draw["draw_count"]) {
                    existing_draw["draw_count"] += 1;
                } else {
                    draws["noncharacter_weapons"].push(draw);
                }
            }
        }
    }

    return draws;
}

function rarityRoll(ratesID: string, tenth: boolean) {
    let rarity;

    const rand = Math.random();

    const ratesData = getRatesData(ratesID);
    if (!ratesData) return;

    const ssr_drop_rate = ratesData["SS Rare"]["drop_rate"];
    const sr_drop_rate = ratesData["S Rare"]["drop_rate"];

    if (rand < ssr_drop_rate) {
        rarity = RarityType.ssr;
    } else if (tenth || rand < (ssr_drop_rate + sr_drop_rate)) {
        rarity = RarityType.sr;
    } else {
        rarity = RarityType.r;
    }

    return rarity;
}

function firstPassRoll(ratesID: string, rarity: RarityType) {
    let total_items = 0;

    const ratesData = getRatesData(ratesID);
    if (!ratesData) return;

    const subListCharacterWeapons = ratesData[rarity][CategoryType.character_weapons];
    if (subListCharacterWeapons) {
        for (const key in subListCharacterWeapons) {
            total_items += subListCharacterWeapons[key]["total_rate"];
        }
    }

    const subListNonCharacterWeapons = ratesData[rarity][CategoryType.noncharacter_weapons];
    if (subListNonCharacterWeapons) {
        for (const key in subListNonCharacterWeapons) {
            total_items += subListNonCharacterWeapons[key]["total_rate"];
        }
    }

    const subListSummons = ratesData[rarity][CategoryType.summons];
    if (subListSummons) {
        for (const key in subListSummons) {
            total_items += subListSummons[key]["total_rate"];
        }
    }

    let rand = randomInt(0, total_items);

    if (subListCharacterWeapons) {
        for (const key in subListCharacterWeapons) {
            rand -= subListCharacterWeapons[key]["total_rate"];
            if (rand <= 0) {
                return { "category_name": CategoryType.character_weapons, "drop_rate": key };
            }
        }
    }

    if (subListNonCharacterWeapons) {
        for (const key in subListNonCharacterWeapons) {
            rand -= subListNonCharacterWeapons[key]["total_rate"];
            if (rand <= 0) {
                return { "category_name": CategoryType.noncharacter_weapons, "drop_rate": key };
            }
        }
    }

    if (subListSummons) {
        for (const key in subListSummons) {
            rand -= subListSummons[key]["total_rate"];
            if (rand <= 0) {
                return { "category_name": CategoryType.summons, "drop_rate": key };
            }
        }
    }
}

function secondPassRoll(ratesID: string, rarity: RarityType, category_name: CategoryType, drop_rate: string) {
    const ratesData = getRatesData(ratesID);
    if (!ratesData) return;

    const subList = ratesData[rarity][category_name];
    if (!subList) return;

    const rand = randomInt(0, subList[drop_rate]["count"]);
    return subList[drop_rate]["list"][rand] as Item;
}