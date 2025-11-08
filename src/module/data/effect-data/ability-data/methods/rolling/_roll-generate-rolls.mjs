import { TeriockRoll } from "../../../../../dice/_module.mjs";

/**
 * Pay the costs necessary for using an ability.
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<void>}
 */
export async function _generateRolls(rollConfig) {
  /** @type {TeriockRoll[]} */
  const rolls = [];
  if (rollConfig.abilityData.interaction === "attack") {
    const flavor = "Attack Roll";
    for (const target of rollConfig.useData.targets) {
      const rollContext = {
        rescale: target.document?.ring.enabled,
        targetImg: target.document.imageLive,
        targetName: target.document.name,
        targetUuid: target.actor?.uuid,
        threshold: target.actor?.system.defense.cc,
      };
      if (rollConfig.useData.rollData["ub"]) {
        rollContext.threshold = target.actor?.system.defense.ac;
        rollContext.diceClass = "ub";
        rollContext.diceTooltip = "Unblockable";
      }
      rolls.push(
        new TeriockRoll(
          rollConfig.useData.formula,
          rollConfig.useData.rollData,
          {
            context: rollContext,
            flavor,
          },
        ),
      );
    }
    if (rollConfig.useData.targets.size === 0) {
      const rollContext = {};
      if (rollConfig.useData.rollData["ub"]) {
        rollContext.diceClass = "ub";
        rollContext.diceTooltip = "Unblockable";
      }
      rolls.push(
        new TeriockRoll(
          rollConfig.useData.formula,
          rollConfig.useData.rollData,
          {
            context: rollContext,
            flavor,
          },
        ),
      );
    }
  } else if (rollConfig.abilityData.interaction === "feat") {
    const flavor = "Feat Save DC";
    for (const target of rollConfig.useData.targets) {
      const rollContext = {
        noDice: true,
        rescale: target.document?.ring.enabled,
        targetImg: target.document.imageLive,
        targetName: target.document.name,
        targetUuid: target.actor?.uuid,
      };
      rolls.push(new TeriockRoll("10", {}, { context: rollContext }));
    }
    const rollContext = {
      diceClass: "feat",
      totalClass: "feat",
    };
    rolls.push(
      new TeriockRoll(rollConfig.useData.formula, rollConfig.useData.rollData, {
        context: rollContext,
        flavor,
      }),
    );
  } else {
    for (const target of rollConfig.useData.targets) {
      const rollContext = {
        noDice: true,
        rescale: target.document?.ring.enabled,
        targetImg: target.document.imageLive,
        targetName: target.document.name,
        targetUuid: target.actor?.uuid,
      };
      rolls.push(new TeriockRoll("10", {}, { context: rollContext }));
    }
  }
  rollConfig.chatData.rolls.push(...rolls);
}
