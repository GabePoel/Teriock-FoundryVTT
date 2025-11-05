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
    foundry.utils.deepClone(abilityData.applies.base.statuses) || new Set();
  let combatExpirations = foundry.utils.deepClone(
    abilityData.applies.base.expiration.normal.combat,
  );
  let transformation = foundry.utils.deepClone(
    abilityData.applies.base.transformation,
  );
  transformation.uuids = new Set();
  let newUuids;
  if (
    abilityData.applies.base.transformation.useFolder &&
    abilityData.applies.base.transformation.uuid
  ) {
    newUuids = await folderContents(
      abilityData.applies.base.transformation.uuid,
      {
        types: ["species"],
      },
    );
  } else {
    newUuids = abilityData.applies.base.transformation.uuids;
  }
  for (const uuid of newUuids) {
    transformation.uuids.add(uuid);
  }
  combatExpirations.who.source = rollConfig.useData.actor.uuid;
  if (crit && abilityData.applies.base.expiration.changeOnCrit) {
    combatExpirations = foundry.utils.mergeObject(
      combatExpirations,
      abilityData.applies.base.expiration.crit.combat,
    );
  }

  // TODO: Switch parsing to unit based.
  let seconds = parseTimeString(abilityData.duration.description);

  if (rollConfig.useData.proficient) {
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
    if (abilityData.applies.proficient.transformation.enabled) {
      transformation.enabled = true;
      transformation.image =
        abilityData.applies.proficient.transformation.image ||
        transformation.image;
      let newUuids;
      if (
        abilityData.applies.proficient.transformation.useFolder &&
        abilityData.applies.proficient.transformation.uuid
      ) {
        newUuids = await folderContents(
          abilityData.applies.proficient.transformation.uuid,
          {
            types: ["species"],
          },
        );
      } else {
        newUuids = abilityData.applies.proficient.transformation.uuids;
      }
      for (const uuid of newUuids) {
        transformation.uuids.add(uuid);
      }
      transformation.select =
        transformation.select ||
        abilityData.applies.proficient.transformation.select;
      transformation.multiple =
        transformation.multiple ||
        abilityData.applies.proficient.transformation.multiple;
      transformation.level = upgradeTransformation(
        transformation.level,
        abilityData.applies.proficient.transformation.level,
      );
      for (const field of Object.keys(transformation.suppression)) {
        transformation.suppression[field] =
          abilityData.applies.proficient.transformation.suppression[field] ||
          transformation.suppression[field];
      }
    }
  }
  if (rollConfig.useData.fluent) {
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
    if (abilityData.applies.fluent.transformation.enabled) {
      transformation.enabled = true;
      transformation.image =
        abilityData.applies.fluent.transformation.image || transformation.image;
      let newUuids;
      if (
        abilityData.applies.fluent.transformation.useFolder &&
        abilityData.applies.fluent.transformation.uuid
      ) {
        newUuids = await folderContents(
          abilityData.applies.fluent.transformation.uuid,
          {
            types: ["species"],
          },
        );
      } else {
        newUuids = abilityData.applies.fluent.transformation.uuids;
      }
      for (const uuid of newUuids) {
        transformation.uuids.add(uuid);
      }
      transformation.select =
        transformation.select ||
        abilityData.applies.fluent.transformation.select;
      transformation.multiple =
        transformation.multiple ||
        abilityData.applies.fluent.transformation.multiple;
      transformation.level = upgradeTransformation(
        transformation.level,
        abilityData.applies.fluent.transformation.level,
      );
      for (const field of Object.keys(transformation.suppression)) {
        transformation.suppression[field] =
          abilityData.applies.fluent.transformation.suppression[field] ||
          transformation.suppression[field];
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
          rollConfig.useData.rollData,
        );
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
    if (abilityData.applies.heightened.transformation.enabled) {
      transformation.enabled = true;
      transformation.image =
        abilityData.applies.heightened.transformation.image ||
        transformation.image;
      let newUuids;
      if (
        abilityData.applies.heightened.transformation.useFolder &&
        abilityData.applies.heightened.transformation.uuid
      ) {
        newUuids = await folderContents(
          abilityData.applies.heightened.transformation.uuid,
          {
            types: ["species"],
          },
        );
      } else {
        newUuids = abilityData.applies.heightened.transformation.uuids;
      }
      for (const uuid of newUuids) {
        transformation.uuids.add(uuid);
      }
      transformation.select =
        transformation.select ||
        abilityData.applies.heightened.transformation.select;
      transformation.multiple =
        transformation.multiple ||
        abilityData.applies.heightened.transformation.multiple;
      transformation.level = upgradeTransformation(
        transformation.level,
        abilityData.applies.heightened.transformation.level,
      );
      for (const field of Object.keys(transformation.suppression)) {
        transformation.suppression[field] =
          abilityData.applies.heightened.transformation.suppression[field] ||
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

  if (rollConfig.useData.proficient) {
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
  if (rollConfig.useData.fluent) {
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
      const rollRoll = new TeriockRoll(
        value,
        rollConfig.useData.actor.getRollData(),
      );
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
    rolls:
      /** @type {Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>} */ rolls,
    hacks: /** @type {Set<Teriock.Parameters.Actor.HackableBodyPart>} */ hacks,
    checks: /** @type {Set<string>} */ checks,
    startStatuses: /** @type {Set<string>} */ startStatuses,
    endStatuses: /** @type {Set<string>} */ endStatuses,
  };
}
