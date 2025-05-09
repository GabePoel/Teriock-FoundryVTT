import { parseAbility } from "./parse-ability.mjs";
import { parseEquipment } from "./parse-equipment.mjs";
import { parseRank } from "./parse-rank.mjs";

export async function parse(item, rawHTML) {
    if (item.type === 'ability') {
        return parseAbility(rawHTML);
    }
    if (item.type === 'equipment') {
        return parseEquipment(rawHTML);
    }
    if (item.type === 'rank') {
        return await parseRank(rawHTML, item.system.className, item.system.classRank);
    }
    throw new Error(`Unknown type: ${item.type}`);
}