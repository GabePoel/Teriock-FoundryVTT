import {
  selectDocumentDialog,
  selectDocumentsDialog,
} from "../../../../applications/dialogs/select-document-dialog.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { folderContents, parseTimeString } from "../../../../helpers/utils.mjs";

/**
 * Generates an effect from ability data based on proficiency level and heightened amount.
 * Creates an effect with appropriate changes, statuses, and duration based on the ability's consequence data.
 *
 * @param {AbilityRollConfig} rollConfig - The roll config to generate the effect from.
 * @param {boolean} crit - If this should generate a critical version of the effect.
 * @returns {Promise<object|false>} Promise that resolves to the generated effect data or false if no effect should be
 *   created.
 * @private
 */
export async function _generateEffect(rollConfig, crit = false) {
  const abilityData = rollConfig.abilityData;
  const heightenAmount = rollConfig.useData.modifiers.heightened;
  let changes = abilityData.changes;
  let statuses =
    foundry.utils.deepClone(abilityData.impacts.base.statuses) || new Set();
  let combatExpirations = foundry.utils.deepClone(
    abilityData.impacts.base.expiration.normal.combat,
  );
  let transformation = foundry.utils.deepClone(
    abilityData.impacts.base.transformation,
  );
  transformation.uuids = new Set();
  let newUuids;
  if (
    abilityData.impacts.base.transformation.useFolder &&
    abilityData.impacts.base.transformation.uuid
  ) {
    newUuids = await folderContents(
      abilityData.impacts.base.transformation.uuid,
      {
        types: ["species"],
      },
    );
  } else {
    newUuids = abilityData.impacts.base.transformation.uuids;
  }
  for (const uuid of newUuids) {
    transformation.uuids.add(uuid);
  }
  combatExpirations.who.source = rollConfig.useData.actor.uuid;
  if (crit && abilityData.impacts.base.expiration.changeOnCrit) {
    combatExpirations = foundry.utils.mergeObject(
      combatExpirations,
      abilityData.impacts.base.expiration.crit.combat,
    );
  }

  // TODO: Switch parsing to unit based.
  let seconds = parseTimeString(abilityData.duration.description);

  if (rollConfig.useData.proficient) {
    if (abilityData.impacts.proficient.statuses.size > 0) {
      statuses = foundry.utils.deepClone(
        abilityData.impacts.proficient.statuses,
      );
    }
    if (abilityData.impacts.proficient.duration > 0) {
      seconds = abilityData.impacts.proficient.duration;
    }
    if (abilityData.impacts.proficient.expiration.doesExpire) {
      combatExpirations = foundry.utils.mergeObject(
        combatExpirations,
        abilityData.impacts.proficient.expiration.normal.combat,
      );
      if (crit && abilityData.impacts.proficient.expiration.changeOnCrit) {
        combatExpirations = foundry.utils.mergeObject(
          combatExpirations,
          abilityData.impacts.proficient.expiration.crit.combat,
        );
      }
    }
    if (abilityData.impacts.proficient.transformation.enabled) {
      transformation.enabled = true;
      transformation.image =
        abilityData.impacts.proficient.transformation.image ||
        transformation.image;
      let newUuids;
      if (
        abilityData.impacts.proficient.transformation.useFolder &&
        abilityData.impacts.proficient.transformation.uuid
      ) {
        newUuids = await folderContents(
          abilityData.impacts.proficient.transformation.uuid,
          {
            types: ["species"],
          },
        );
      } else {
        newUuids = abilityData.impacts.proficient.transformation.uuids;
      }
      for (const uuid of newUuids) {
        transformation.uuids.add(uuid);
      }
      transformation.select =
        transformation.select ||
        abilityData.impacts.proficient.transformation.select;
      transformation.multiple =
        transformation.multiple ||
        abilityData.impacts.proficient.transformation.multiple;
      transformation.level = upgradeTransformation(
        transformation.level,
        abilityData.impacts.proficient.transformation.level,
      );
      for (const field of Object.keys(transformation.suppression)) {
        transformation.suppression[field] =
          abilityData.impacts.proficient.transformation.suppression[field] ||
          transformation.suppression[field];
      }
    }
  }
  if (rollConfig.useData.fluent) {
    if (abilityData.impacts.fluent.statuses.size > 0) {
      statuses = foundry.utils.deepClone(abilityData.impacts.fluent.statuses);
    }
    if (abilityData.impacts.fluent.duration > 0) {
      seconds = abilityData.impacts.fluent.duration;
    }
    if (abilityData.impacts.fluent.expiration.doesExpire) {
      combatExpirations = foundry.utils.mergeObject(
        combatExpirations,
        abilityData.impacts.fluent.expiration.normal.combat,
      );
      if (crit && abilityData.impacts.fluent.expiration.changeOnCrit) {
        combatExpirations = foundry.utils.mergeObject(
          combatExpirations,
          abilityData.impacts.fluent.expiration.crit.combat,
        );
      }
    }
    if (abilityData.impacts.fluent.transformation.enabled) {
      transformation.enabled = true;
      transformation.image =
        abilityData.impacts.fluent.transformation.image || transformation.image;
      let newUuids;
      if (
        abilityData.impacts.fluent.transformation.useFolder &&
        abilityData.impacts.fluent.transformation.uuid
      ) {
        newUuids = await folderContents(
          abilityData.impacts.fluent.transformation.uuid,
          {
            types: ["species"],
          },
        );
      } else {
        newUuids = abilityData.impacts.fluent.transformation.uuids;
      }
      for (const uuid of newUuids) {
        transformation.uuids.add(uuid);
      }
      transformation.select =
        transformation.select ||
        abilityData.impacts.fluent.transformation.select;
      transformation.multiple =
        transformation.multiple ||
        abilityData.impacts.fluent.transformation.multiple;
      transformation.level = upgradeTransformation(
        transformation.level,
        abilityData.impacts.fluent.transformation.level,
      );
      for (const field of Object.keys(transformation.suppression)) {
        transformation.suppression[field] =
          abilityData.impacts.fluent.transformation.suppression[field] ||
          transformation.suppression[field];
      }
    }
  }
  if (heightenAmount > 0) {
    if (abilityData.impacts.heightened.changes.length > 0) {
      const heightenedChanges = foundry.utils.deepClone(
        abilityData.impacts.heightened.changes,
      );
      for (const change of heightenedChanges) {
        const heightenEvaluateRoll = new TeriockRoll(
          change.value,
          rollConfig.useData.rollData,
        );
        await heightenEvaluateRoll.evaluate();
        change.value = heightenEvaluateRoll.result.toString();
      }
      changes = [...changes, ...heightenedChanges];
    }
    if (abilityData.impacts.heightened.statuses.size > 0) {
      for (const status of abilityData.impacts.heightened.statuses) {
        statuses.add(status);
      }
    }
    if (abilityData.impacts.heightened.duration > 0) {
      seconds += abilityData.impacts.heightened.duration * heightenAmount;
      seconds =
        Math.round(seconds / abilityData.impacts.heightened.duration) *
        abilityData.impacts.heightened.duration;
    }
    if (abilityData.impacts.heightened.transformation.enabled) {
      transformation.enabled = true;
      transformation.image =
        abilityData.impacts.heightened.transformation.image ||
        transformation.image;
      let newUuids;
      if (
        abilityData.impacts.heightened.transformation.useFolder &&
        abilityData.impacts.heightened.transformation.uuid
      ) {
        newUuids = await folderContents(
          abilityData.impacts.heightened.transformation.uuid,
          {
            types: ["species"],
          },
        );
      } else {
        newUuids = abilityData.impacts.heightened.transformation.uuids;
      }
      for (const uuid of newUuids) {
        transformation.uuids.add(uuid);
      }
      transformation.select =
        transformation.select ||
        abilityData.impacts.heightened.transformation.select;
      transformation.multiple =
        transformation.multiple ||
        abilityData.impacts.heightened.transformation.multiple;
      transformation.level = upgradeTransformation(
        transformation.level,
        abilityData.impacts.heightened.transformation.level,
      );
      for (const field of Object.keys(transformation.suppression)) {
        transformation.suppression[field] =
          abilityData.impacts.heightened.transformation.suppression[field] ||
          transformation.suppression[field];
      }
    }
    // Heightening combat expirations is not currently supported
    // TODO: Support heightening combat expirations lol
  }
  //noinspection JSValidateTypes
  transformation.uuids = Array.from(transformation.uuids);
  if (!crit) {
    const choices = transformation.uuids.map((uuid) => fromUuidSync(uuid));
    if (transformation.select) {
      let chosen;
      if (transformation.multiple) {
        chosen = await selectDocumentsDialog(choices, {
          hint: "Please one or more select species to transform into.",
          title: "Select Species",
          tooltipAsync: true,
          openable: true,
        });
      } else {
        chosen = [
          await selectDocumentDialog(choices, {
            hint: "Please select a species to transform into.",
            title: "Select Species",
            tooltipAsync: true,
            openable: true,
          }),
        ];
      }
      if (chosen) {
        //noinspection JSValidateTypes
        transformation.uuids = chosen.map((s) => s.uuid);
      }
    }
  }

  /** @type {Partial<TeriockConsequenceModel>} */
  const effectData = {
    name: `${abilityData.parent?.name} Effect`,
    type: "consequence",
    img: abilityData.parent.img,
    changes: changes,
    statuses: Array.from(statuses),
    system: {
      associations: [],
      blocks: abilityData.messageParts.blocks,
      critical: crit,
      deleteOnExpire: true,
      expirations: {
        combat: combatExpirations,
        conditions: {
          absent: Array.from(abilityData.duration.conditions.absent),
          present: Array.from(abilityData.duration.conditions.present),
        },
        movement: abilityData.duration.stationary,
        dawn: abilityData.duration.unit === "untilDawn",
        sustained: abilityData.sustained,
        description: abilityData.endCondition,
      },
      heightened: heightenAmount,
      hierarchy: {
        subIds: Array.from(abilityData.hierarchy.subIds || new Set()),
        rootUuid: abilityData.parent.parent.uuid,
      },
      source: abilityData.parent.uuid,
      transformation: transformation,
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
 * Maximum of two transformation levels.
 * @param {Teriock.Parameters.Shared.TransformationLevel} level1
 * @param {Teriock.Parameters.Shared.TransformationLevel} level2
 * @returns {Teriock.Parameters.Shared.TransformationLevel}
 */
function upgradeTransformation(level1, level2) {
  if (level1 === "minor") {
    return level2;
  } else if (level1 === "full") {
    if (level2 === "greater") {
      return level2;
    }
  }
  return level1;
}

/**
 * Generates takes data from ability data based on proficiency level and heightened amount.
 * Creates rolls, hacks, checks, and status changes based on the ability's consequence data.
 *
 * @param {AbilityRollConfig} rollConfig - The roll config data to generate takes from.
 * @returns {object} Object containing rolls, hacks, checks, startStatuses, and endStatuses.
 * @private
 */
export function _generateTakes(rollConfig) {
  const heightenAmount = rollConfig.useData.modifiers.heightened;
  const abilityData = rollConfig.abilityData;
  let rolls = foundry.utils.deepClone(abilityData.impacts.base.rolls) || {};
  let hacks =
    foundry.utils.deepClone(abilityData.impacts.base.hacks) || new Set();
  let checks =
    foundry.utils.deepClone(abilityData.impacts.base.checks) || new Set();
  let startStatuses =
    foundry.utils.deepClone(abilityData.impacts.base.startStatuses) ||
    new Set();
  let endStatuses =
    foundry.utils.deepClone(abilityData.impacts.base.endStatuses) || new Set();

  if (rollConfig.useData.proficient) {
    rolls = { ...rolls, ...abilityData.impacts.proficient.rolls };
    hacks = new Set([
      ...hacks,
      ...(abilityData.impacts.proficient.hacks || []),
    ]);
    checks = new Set([
      ...checks,
      ...(abilityData.impacts.proficient.checks || []),
    ]);
    startStatuses = new Set([
      ...startStatuses,
      ...(abilityData.impacts.proficient.startStatuses || []),
    ]);
    endStatuses = new Set([
      ...endStatuses,
      ...(abilityData.impacts.proficient.endStatuses || []),
    ]);
  }
  if (rollConfig.useData.fluent) {
    rolls = { ...rolls, ...abilityData.impacts.fluent.rolls };
    hacks = new Set([...hacks, ...(abilityData.impacts.fluent.hacks || [])]);
    checks = new Set([...checks, ...(abilityData.impacts.fluent.checks || [])]);
    startStatuses = new Set([
      ...startStatuses,
      ...(abilityData.impacts.fluent.startStatuses || []),
    ]);
    endStatuses = new Set([
      ...endStatuses,
      ...(abilityData.impacts.fluent.endStatuses || []),
    ]);
  }
  if (heightenAmount > 0) {
    for (const [key, value] of Object.entries(
      abilityData.impacts.heightened.rolls || {},
    )) {
      const rollRoll = new TeriockRoll(
        value,
        rollConfig.useData.actor.getRollData(),
      );
      rollRoll.alter(heightenAmount, 0, { multiplyNumeric: true });
      rolls[key] = (rolls[key] ? rolls[key] + " + " : "") + rollRoll.formula;
    }
    for (const hack of abilityData.impacts.heightened.hacks || []) {
      hacks.add(hack);
    }
    for (const check of abilityData.impacts.heightened.checks || []) {
      checks.add(check);
    }
    for (const status of abilityData.impacts.heightened.startStatuses || []) {
      startStatuses.add(status);
    }
    for (const status of abilityData.impacts.heightened.endStatuses || []) {
      endStatuses.add(status);
    }
  }

  return {
    rolls:
      /** @type {Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>} */ rolls,
    hacks: /** @type {Set<Teriock.Parameters.Actor.HackableBodyPart>} */ hacks,
    checks: /** @type {Set<string>} */ checks,
    startStatuses: /** @type {Set<string>} */ startStatuses,
    endStatuses: /** @type {Set<string>} */ endStatuses,
  };
}
