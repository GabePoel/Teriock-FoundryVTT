import { rollAbility } from "./instances/ability.mjs";
import { rollEquipment } from "./instances/equipment.mjs";
import { rollFluency } from "./instances/fluency.mjs";
import { rollResource } from "./instances/resource.mjs";

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