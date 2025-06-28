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
export async function _generateEffect(abilityData, actor, heightenAmount = 0) {
  let changes = abilityData.applies.base.changes || [];
  let statuses = abilityData.applies.base.statuses || new Set();

  let seconds = parseTimeString(abilityData.duration);

  if (abilityData.isProficient) {
    if (abilityData.applies.proficient.changes.length > 0) {
      changes = abilityData.applies.proficient.changes;
    }
    if (abilityData.applies.proficient.statuses.size > 0) {
      statuses = new Set(abilityData.applies.proficient.statuses);
    }
  }
  if (abilityData.isFluent) {
    if (abilityData.applies.fluent.changes.length > 0) {
      changes = abilityData.applies.fluent.changes;
    }
    if (abilityData.applies.fluent.statuses.size > 0) {
      statuses = new Set(abilityData.applies.fluent.statuses);
    }
  }
  if (heightenAmount > 0) {
    if (abilityData.applies.heightened.changes.length > 0) {
      const heightenedChanges = abilityData.applies.heightened.changes;
      for (const change of heightenedChanges) {
        change.value = change.value * heightenAmount;
      }
      changes = [...changes, ...heightenedChanges];
    }
    if (abilityData.applies.heightened.statuses.size > 0) {
      for (const status of abilityData.applies.heightened.statuses) {
        statuses.add(status);
      }
    }
    if (abilityData.applies.heightened.duration > 0) {
      seconds += abilityData.applies.heightened.duration * heightenAmount;
      seconds = Math.round(seconds / abilityData.applies.heightened.duration) * abilityData.applies.heightened.duration;
    }
  }

  let description = await abilityData.parent.buildMessage();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = description;

  // Remove .tmes-header-box and .tmes-bar-box elements
  const headerBoxes = tempDiv.querySelectorAll(".tmes-header-box");
  const barBoxes = tempDiv.querySelectorAll(".tmes-bar-box");

  headerBoxes.forEach((element) => element.remove());
  barBoxes.forEach((element) => element.remove());

  description = tempDiv.innerHTML;

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

  const effectData = {
    name: `${abilityData.parent?.name} Effect`,
    type: "effect",
    img: abilityData.parent?.img,
    changes: changes,
    statuses: Array.from(statuses),
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
      childIds: abilityData.childIds || [],
      childUuids: abilityData.childUuids || [],
    },
    duration: {
      seconds: seconds || 0,
    },
  };
  console.log(effectData);
  if ((seconds > 0 || abilityData.duration.toLowerCase().trim() !== "instant") && abilityData.maneuver !== "passive") {
    return effectData;
  }
  return false;
}

/**
 * @param {TeriockAbilityData} abilityData
 * @param {number} heightenAmount
 * @returns {Object}
 * @private
 */
export function _generateTakes(abilityData, heightenAmount = 0) {
  let rolls = abilityData.applies.base.rolls || {};
  let hacks = abilityData.applies.base.hacks || new Set();
  let checks = abilityData.applies.base.checks || new Set();
  let startStatuses = abilityData.applies.base.startStatuses || new Set();
  let endStatuses = abilityData.applies.base.endStatuses || new Set();

  if (abilityData.isProficient) {
    rolls = { ...rolls, ...abilityData.applies.proficient.rolls };
    hacks = new Set([...hacks, ...(abilityData.applies.proficient.hacks || [])]);
    checks = new Set([...checks, ...(abilityData.applies.proficient.checks || [])]);
    startStatuses = new Set([...startStatuses, ...(abilityData.applies.proficient.startStatuses || [])]);
    endStatuses = new Set([...endStatuses, ...(abilityData.applies.proficient.endStatuses || [])]);
  }
  if (abilityData.isFluent) {
    rolls = { ...rolls, ...abilityData.applies.fluent.rolls };
    hacks = new Set([...hacks, ...(abilityData.applies.fluent.hacks || [])]);
    checks = new Set([...checks, ...(abilityData.applies.fluent.checks || [])]);
    startStatuses = new Set([...startStatuses, ...(abilityData.applies.fluent.startStatuses || [])]);
    endStatuses = new Set([...endStatuses, ...(abilityData.applies.fluent.endStatuses || [])]);
  }
  if (heightenAmount > 0) {
    for (const [key, value] of Object.entries(abilityData.applies.heightened.rolls || {})) {
      rolls[key] = rolls[key] || "";
      for (let i = 0; i < heightenAmount; i++) {
        rolls[key] += `+${value}`;
        if (rolls[key].trim().startsWith("+")) {
          rolls[key] = rolls[key].trim().slice(1);
        }
      }
    }
    for (const hack of abilityData.applies.heightened.hacks || []) {
      hacks.add(hack);
    }
    for (const check of abilityData.applies.heightened.checks || []) {
      checks.add(check);
    }
    for (const status of abilityData.applies.heightened.startStatuses || []) {
      startStatuses.add(status);
    }
    for (const status of abilityData.applies.heightened.endStatuses || []) {
      endStatuses.add(status);
    }
  }

  return {
    rolls: rolls,
    hacks: hacks,
    checks: checks,
    startStatuses: startStatuses,
    endStatuses: endStatuses,
  };
}
