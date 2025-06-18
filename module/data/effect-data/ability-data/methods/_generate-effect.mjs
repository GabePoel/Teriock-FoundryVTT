/** @import TeriockAbilityData from "../ability-data.mjs"; */
/** @import TeriockActor from "../../../../documents/actor.mjs"; */
import TeriockEffect from "../../../../documents/effect.mjs";

/**
 * @param {TeriockAbilityData} abilityData 
 * @param {TeriockActor} actor 
 * @returns 
 */
export async function generateEffect(abilityData, actor) {
  let changes = abilityData.applies.base.changes || [];
  let statuses = abilityData.applies.base.statuses || [];
  let description = abilityData.overview.base || '';
  if (abilityData.isProficient) {
    if (abilityData.applies.proficient.changes.length > 0) {
      changes = abilityData.applies.proficient.changes;
    }
    if (abilityData.applies.proficient.statuses.length > 0) {
      statuses = abilityData.applies.proficient.statuses;
    }
    description += abilityData.overview.proficient || '';
  }
  if (abilityData.isFluent) {
    if (abilityData.applies.fluent.changes.length > 0) {
      changes = abilityData.applies.fluent.changes;
    }
    if (abilityData.applies.fluent.statuses.length > 0) {
      statuses = abilityData.applies.fluent.statuses;
    }
    description += abilityData.overview.fluent || '';
  }
  const effect = {
    name: abilityData.parent?.name,
    type: 'effect',
    img: abilityData.parent?.img,
    changes: changes,
    statuses: statuses,
    description: description,
    system: {
      source: abilityData.parent?._id,
    },
  }
  const existingEffect = actor?.effectTypes?.effect?.find(e => e.name === effect.name);
  if (existingEffect) {
    await existingEffect.delete();
  }
  return await TeriockEffect.create(effect, { parent: actor });
}