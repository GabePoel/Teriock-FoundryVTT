import { rollAbility } from "./rolling-ability.mjs";
import { rollEquipment } from "./rolling-equipment.mjs";
import { rollResource } from "./rolling-resource.mjs";
import { rollFluency } from "./rolling-fluency.mjs";

export async function makeRoll(document, options) {
    if (document.type === 'ability') {
        await rollAbility(document, options);
    } else if (document.type === 'equipment') {
        await rollEquipment(document, options);
    } else if (document.type === 'resource') {
        await rollResource(document, options);
    } else if (document.type === 'fluency') {
        await rollFluency(document, options);
    } else {
        console.warn(`Teriock | Roll type ${document.type} not implemented`);
    }
    return;
}