import { parseAbility } from "./parse-ability.mjs";
import { parseEquipment } from "./parse-equipment.mjs";

export function parse(type, rawHTML) {
    if (type === 'ability') {
        return parseAbility(rawHTML);
    }
    if (type === 'equipment') {
        return parseEquipment(rawHTML);
    }
    throw new Error(`Unknown type: ${type}`);
}