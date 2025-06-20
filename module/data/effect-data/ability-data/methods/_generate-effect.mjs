/** @import TeriockAbilityData from "../ability-data.mjs"; */
/** @import TeriockActor from "../../../../documents/actor.mjs"; */
import TeriockEffect from "../../../../documents/effect.mjs";
import { parseTimeString } from "../../../../helpers/utils.mjs";

/**
 * @param {TeriockAbilityData} abilityData
 * @param {TeriockActor} actor
 * @returns {Promise<TeriockEffect>}
 * @private
 */
export async function _generateEffect(abilityData, actor) {
  let changes = abilityData.applies.base.changes || [];
  let statuses = abilityData.applies.base.statuses || [];
  let description = abilityData.overview.base || "";
  if (abilityData.isProficient) {
    if (abilityData.applies.proficient.changes.length > 0) {
      changes = abilityData.applies.proficient.changes;
    }
    if (abilityData.applies.proficient.statuses.length > 0) {
      statuses = abilityData.applies.proficient.statuses;
    }
    description += abilityData.overview.proficient || "";
  }
  if (abilityData.isFluent) {
    if (abilityData.applies.fluent.changes.length > 0) {
      changes = abilityData.applies.fluent.changes;
    }
    if (abilityData.applies.fluent.statuses.length > 0) {
      statuses = abilityData.applies.fluent.statuses;
    }
    description += abilityData.overview.fluent || "";
  }
  const seconds = parseTimeString(abilityData.duration);
  const condition = {
    value: null,
    present: false,
  };
  let dawn = false;
  let movement = false;
  let sustained = false;
  if (abilityData.duration.toLowerCase().includes("while dueling")) {
    condition.value = "dueling";
    condition.present = false;
  } else if (abilityData.duration.toLowerCase().includes("while up")) {
    condition.value = "down";
    condition.present = true;
  } else if (abilityData.duration.toLowerCase().includes("while down")) {
    condition.value = "down";
    condition.present = false;
  } else if (abilityData.duration.toLowerCase().includes("while alive")) {
    condition.value = "dead";
    condition.present = true;
  } else if (abilityData.duration.toLowerCase().includes("while stationary")) {
    movement = true;
  } else if (abilityData.duration.toLowerCase().includes("until dawn")) {
    dawn = true;
  }
  if (abilityData.sustained) {
    sustained = true;
  }
  const effect = {
    name: abilityData.parent?.name,
    type: "effect",
    img: abilityData.parent?.img,
    changes: changes,
    statuses: statuses,
    description: description,
    system: {
      source: abilityData.parent?._id,
      deleteOnExpire: true,
      expirations: {
        condition: condition,
        movement: movement,
        dawn: dawn,
        sustained: sustained,
      },
    },
    duration: {
      seconds: seconds || undefined,
    },
  };
  console.log("Generating effect", effect);
  const existingEffect = actor?.effectTypes?.effect?.find((e) => e.name === effect.name);
  if (existingEffect) {
    await existingEffect.delete();
  }
  const newEffect = await TeriockEffect.create(effect, { parent: actor });
  console.log("Effect created", newEffect);
  return newEffect;
}
