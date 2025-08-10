import { TeriockRoll } from "../../../../documents/_module.mjs";
import { parseTimeString } from "../../../../helpers/utils.mjs";

/**
 * Generates an effect from ability data based on proficiency level and heightened amount.
 * Creates an effect with appropriate changes, statuses, and duration based on the ability's consequence data.
 *
 * @param {TeriockAbilityData} abilityData - The ability data to generate effect from.
 * @param {TeriockActor} actor - The actor that owns the ability.
 * @param {number} heightenAmount - The amount of heightening applied to the ability.
 * @param {boolean} crit - If this should generate a critical version of the effect.
 * @returns {Promise<object|false>} Promise that resolves to the generated effect data or false if no effect should be
 *   created.
 * @private
 */
export async function _generateEffect(
  abilityData,
  actor,
  heightenAmount = 0,
  crit = false,
) {
  let changes = abilityData.changes;
  let statuses =
    foundry.utils.deepClone(abilityData.applies.base.statuses) || new Set();
  let combatExpirations = foundry.utils.deepClone(
    abilityData.applies.base.expiration.normal.combat,
  );
  combatExpirations.who.source = abilityData.actor?.uuid;
  if (crit && abilityData.applies.base.expiration.changeOnCrit) {
    combatExpirations = foundry.utils.mergeObject(
      combatExpirations,
      abilityData.applies.base.expiration.crit.combat,
    );
  }

  // TODO: Switch parsing to unit based.
  let seconds = parseTimeString(abilityData.duration.description);

  if (abilityData.parent.isProficient) {
    if (abilityData.applies.proficient.statuses.size > 0) {
      statuses = foundry.utils.deepClone(
        abilityData.applies.proficient.statuses,
      );
    }
    if (abilityData.applies.proficient.duration > 0) {
      seconds = abilityData.applies.proficient.duration;
    }
    if (abilityData.applies.proficient.expiration.doesExpire) {
      combatExpirations = foundry.utils.mergeObject(
        combatExpirations,
        abilityData.applies.proficient.expiration.normal.combat,
      );
      if (crit && abilityData.applies.proficient.expiration.changeOnCrit) {
        combatExpirations = foundry.utils.mergeObject(
          combatExpirations,
          abilityData.applies.proficient.expiration.crit.combat,
        );
      }
    }
  }
  if (abilityData.parent.isFluent) {
    if (abilityData.applies.fluent.statuses.size > 0) {
      statuses = foundry.utils.deepClone(abilityData.applies.fluent.statuses);
    }
    if (abilityData.applies.fluent.duration > 0) {
      seconds = abilityData.applies.fluent.duration;
    }
    if (abilityData.applies.fluent.expiration.doesExpire) {
      combatExpirations = foundry.utils.mergeObject(
        combatExpirations,
        abilityData.applies.fluent.expiration.normal.combat,
      );
      if (crit && abilityData.applies.fluent.expiration.changeOnCrit) {
        combatExpirations = foundry.utils.mergeObject(
          combatExpirations,
          abilityData.applies.fluent.expiration.crit.combat,
        );
      }
    }
  }
  if (heightenAmount > 0) {
    if (abilityData.applies.heightened.changes.length > 0) {
      const heightenedChanges = foundry.utils.deepClone(
        abilityData.applies.heightened.changes,
      );
      for (const change of heightenedChanges) {
        const heightenEvaluateRoll = new TeriockRoll(
          change.value,
          actor.getRollData(),
        );
        heightenEvaluateRoll.alter(heightenAmount, 0, {
          multiplyNumeric: true,
        });
        await heightenEvaluateRoll.evaluate();
        change.value = heightenEvaluateRoll.result.toString();
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
      seconds =
        Math.round(seconds / abilityData.applies.heightened.duration) *
        abilityData.applies.heightened.duration;
    }
    // Heightening combat expirations is not currently supported
    // TODO: Support heightening combat expirations lol
  }

  let description = await abilityData.parent.buildMessage();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = description;

  // Remove .tmes-header-box and .tmes-bar-box elements
  const headerBoxes = tempDiv.querySelectorAll(".tmes-header-box");
  const barBoxes = tempDiv.querySelectorAll(".tmes-bar-box");
  const embeddedBlocks = tempDiv.querySelectorAll(".abm-embedded-block");

  headerBoxes.forEach((element) => element.remove());
  barBoxes.forEach((element) => element.remove());
  embeddedBlocks.forEach((element) => element.remove());

  description = tempDiv.innerHTML;

  const condition = {
    value: null,
    present: false,
  };
  let dawn = false;
  let movement = false;
  let sustained = false;
  if (
    abilityData.duration.description.toLowerCase().includes("while dueling")
  ) {
    condition.value = "dueling";
    condition.present = false;
  } else if (
    abilityData.duration.description.toLowerCase().includes("while up")
  ) {
    condition.value = "down";
    condition.present = true;
  } else if (
    abilityData.duration.description.toLowerCase().includes("while down")
  ) {
    condition.value = "down";
    condition.present = false;
  } else if (
    abilityData.duration.description.toLowerCase().includes("while alive")
  ) {
    condition.value = "dead";
    condition.present = true;
  } else if (
    abilityData.duration.description.toLowerCase().includes("while stationary")
  ) {
    movement = true;
  } else if (
    abilityData.duration.description.toLowerCase().includes("until dawn")
  ) {
    dawn = true;
  }
  if (abilityData.sustained) {
    sustained = true;
  }

  /** @type {Partial<TeriockConsequenceData>} */
  const effectData = {
    name: `${abilityData.parent?.name} Effect${crit ? " (Crit)" : ""}`,
    type: "consequence",
    img: abilityData.parent?.img,
    changes: changes,
    statuses: Array.from(statuses),
    // description: description,
    system: {
      source: abilityData.parent?._id,
      deleteOnExpire: true,
      sourceDescription: description,
      expirations: {
        combat: combatExpirations,
        condition: condition,
        movement: movement,
        dawn: dawn,
        sustained: sustained,
        description: abilityData.endCondition,
      },
      hierarchy: {
        subIds: Array.from(abilityData.hierarchy.subIds || new Set()),
        rootUuid: abilityData.parent.parent.uuid,
      },
    },
    duration: {
      seconds: seconds || 0,
    },
  };
  if (
    (seconds > 0 ||
      abilityData.duration.description.toLowerCase().trim() !== "instant") &&
    abilityData.maneuver !== "passive"
  ) {
    return effectData;
  }
  return false;
}

/**
 * Generates takes data from ability data based on proficiency level and heightened amount.
 * Creates rolls, hacks, checks, and status changes based on the ability's consequence data.
 *
 * @param {TeriockAbilityData} abilityData - The ability data to generate takes from.
 * @param {number} heightenAmount - The amount of heightening applied to the ability.
 * @returns {Object} Object containing rolls, hacks, checks, startStatuses, and endStatuses.
 * @private
 */
export function _generateTakes(abilityData, heightenAmount = 0) {
  let rolls = foundry.utils.deepClone(abilityData.applies.base.rolls) || {};
  let hacks =
    foundry.utils.deepClone(abilityData.applies.base.hacks) || new Set();
  let checks =
    foundry.utils.deepClone(abilityData.applies.base.checks) || new Set();
  let startStatuses =
    foundry.utils.deepClone(abilityData.applies.base.startStatuses) ||
    new Set();
  let endStatuses =
    foundry.utils.deepClone(abilityData.applies.base.endStatuses) || new Set();

  if (abilityData.parent.isProficient) {
    rolls = { ...rolls, ...abilityData.applies.proficient.rolls };
    hacks = new Set([
      ...hacks,
      ...(abilityData.applies.proficient.hacks || []),
    ]);
    checks = new Set([
      ...checks,
      ...(abilityData.applies.proficient.checks || []),
    ]);
    startStatuses = new Set([
      ...startStatuses,
      ...(abilityData.applies.proficient.startStatuses || []),
    ]);
    endStatuses = new Set([
      ...endStatuses,
      ...(abilityData.applies.proficient.endStatuses || []),
    ]);
  }
  if (abilityData.parent.isFluent) {
    rolls = { ...rolls, ...abilityData.applies.fluent.rolls };
    hacks = new Set([...hacks, ...(abilityData.applies.fluent.hacks || [])]);
    checks = new Set([...checks, ...(abilityData.applies.fluent.checks || [])]);
    startStatuses = new Set([
      ...startStatuses,
      ...(abilityData.applies.fluent.startStatuses || []),
    ]);
    endStatuses = new Set([
      ...endStatuses,
      ...(abilityData.applies.fluent.endStatuses || []),
    ]);
  }
  if (heightenAmount > 0) {
    for (const [key, value] of Object.entries(
      abilityData.applies.heightened.rolls || {},
    )) {
      const rollRoll = new TeriockRoll(value, abilityData.actor.getRollData());
      rollRoll.alter(heightenAmount, 0, { multiplyNumeric: true });
      rolls[key] = (rolls[key] ? rolls[key] + " + " : "") + rollRoll.formula;
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
    rolls: /** @type {ConsequenceRolls} */ rolls,
    hacks: /** @type {Set<Teriock.Parameters.Actor.HackableBodyPart>} */ hacks,
    checks: /** @type {Set<string>} */ checks,
    startStatuses: /** @type {Set<string>} */ startStatuses,
    endStatuses: /** @type {Set<string>} */ endStatuses,
  };
}
