import { rollAbility } from "./rolling-ability.mjs";
import { rollEquipment } from "./rolling-equipment.mjs";

export async function makeRoll(document, options) {
    if (document.type === 'ability') {
        await rollAbility(document, options);
    } else if (document.type === 'equipment') {
        await rollEquipment(document, options);
    }
}