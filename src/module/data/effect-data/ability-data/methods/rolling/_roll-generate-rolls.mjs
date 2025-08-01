import TeriockRoll from "../../../../../documents/roll.mjs";
import { tokenActor, tokenImage, tokenName } from "../../../../../helpers/utils.mjs";

/**
 * Pay the costs necessary for using an ability.
 *
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<void>}
 */
export async function _generateRolls(rollConfig) {
  /** @type {TeriockRoll[]} */
  const rolls = [];
  if (rollConfig.abilityData.interaction === "attack") {
    for (const target of rollConfig.useData.targets) {
      const rollContext = {
        targetImg: tokenImage(target),
        targetName: tokenName(target),
        targetUuid: tokenActor(target).uuid,
        threshold: tokenActor(target).system.cc,
      };
      if (rollConfig.useData.rollData["ub"]) {
        rollContext.threshold = tokenActor(target).system.ac;
        rollContext.diceClass = "ub";
        rollContext.diceTooltip = "Unblockable";
      }
      rolls.push(
        new TeriockRoll(
          rollConfig.useData.formula,
          rollConfig.useData.rollData,
          { context: rollContext },
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
          { context: rollContext },
        ),
      );
    }
  } else if (rollConfig.abilityData.interaction === "feat") {
    for (const target of rollConfig.useData.targets) {
      const rollContext = {
        targetImg: tokenImage(target),
        targetName: tokenName(target),
        targetUuid: tokenActor(target).uuid,
        noDice: true,
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
      }),
    );
  } else {
    for (const target of rollConfig.useData.targets) {
      const rollContext = {
        targetImg: tokenImage(target),
        targetName: tokenName(target),
        targetUuid: tokenActor(target).uuid,
        noDice: true,
      };
      rolls.push(new TeriockRoll("10", {}, { context: rollContext }));
    }
  }
  rollConfig.chatData.rolls.push(...rolls);
}
