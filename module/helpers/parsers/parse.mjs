import { parseEquipment } from "./parse-equipment.mjs";
import { parseRank } from "./parse-rank.mjs";

export async function parse(document, rawHTML) {
    if (document.type === 'equipment') {
        return parseEquipment(rawHTML);
    }
    if (document.type === 'rank') {
        return await parseRank(rawHTML, document);
    }
    throw new Error(`Unknown type: ${document.type}`);
}