/** @import TeriockBaseActorData from "../base-data.mjs"; */
import { encumbranceData } from "../../../../content/encumbrance.mjs";

/**
 * Performs post-update operations for a Teriock actor's base data.
 * This function orchestrates several important maintenance tasks that should
 * occur after the actor's data has been updated:
 *
 * 1. **Encumbrance Management**: Applies status effects based on current encumbrance level
 * 2. **Token Preparation**: Updates token sizes and vision modes to match actor state
 * 3. **Down Checks**: Set whatever type of "down" is appropriate
 * 4. **Ethereal Death Check**: Handles special death mechanics for ethereal creatures
 * 5. **Expiration Monitoring**: Checks and processes expiration effects
 *
 * @param {TeriockBaseActorData} system - The actor's base data system object
 * @param {SkipFunctions} skipFunctions - Functions that should be skipped
 * @returns {Promise<void>} Resolves when all post-update operations are complete
 * @private
 */
export async function _postUpdate(system, skipFunctions = {}) {
  if (!skipFunctions.applyEncumbrance) {
    await applyEncumbrance(system);
  }
  if (!skipFunctions.prepareTokens) {
    await prepareTokens(system);
  }
  if (!skipFunctions.checkDown) {
    await checkDown(system);
  }
  if (!skipFunctions.etherealKill) {
    await etherealKill(system);
  }
  if (!skipFunctions.checkExpirations) {
    await checkExpirations(system);
  }
}

/**
 * Applies encumbrance status effects based on the actor's current encumbrance level.
 *
 * Encumbrance levels are calculated based on the actor's carried weight relative to
 * their carrying capacity. The system applies progressive status effects:
 * - Level 1: "encumbered" status
 * - Level 2: "slowed" status (in addition to encumbered)
 * - Level 3: "immobilized" status (in addition to encumbered and slowed)
 *
 * This function ensures that the actor's status effects accurately reflect their
 * current encumbrance state by toggling the appropriate status effects.
 *
 * Relevant wiki pages:
 * - [Encumbered](https://wiki.teriock.com/index.php/Condition:Encumbered)
 * - [Slowed](https://wiki.teriock.com/index.php/Condition:Slowed)
 * - [Immobilized](https://wiki.teriock.com/index.php/Condition:Immobilized)
 *
 * @param {TeriockBaseActorData} system - The actor's base data system object
 * @returns {Promise<void>} Resolves when all encumbrance status effects are applied
 *
 * @example
 * // Apply encumbrance effects for an actor carrying too much weight
 * await applyEncumbrance(actor.system);
 */
async function applyEncumbrance(system) {
  const actor = system.parent;
  const level = system.encumbranceLevel || 0;
  const maxLevel = 3;

  const wantedEffects = [];
  const unwantedEffects = [];

  for (let i = 1; i <= maxLevel; i++) {
    const effectData = encumbranceData[`level${i}`];
    if (level >= i) {
      wantedEffects.push(effectData);
    } else {
      unwantedEffects.push(effectData);
    }
  }

  const toCreate = [];
  for (const wanted of wantedEffects) {
    const effect = actor.effects.getName(wanted.name);
    if (!effect) {
      toCreate.push(wanted);
    }
  }
  await actor.createEmbeddedDocuments("ActiveEffect", toCreate);

  const toDelete = [];
  for (const unwanted of unwantedEffects) {
    const effect = actor.effects.getName(unwanted.name);
    if (effect) {
      toDelete.push(effect);
    }
  }
  await actor.deleteEmbeddedDocuments(
    "ActiveEffect",
    toDelete.map((e) => e._id),
  );
}

/**
 * Prepares and updates all tokens associated with the actor.
 *
 * This function performs two main token maintenance tasks:
 *
 * 1. **Size Synchronization**: Updates token dimensions to match the actor's
 *    named size (Tiny, Small, Medium, Large, Huge, Gargantuan, Colossal)
 * 2. **Vision Mode Updates**: Sets the appropriate vision mode based on whether
 *    the actor has the "ethereal" status effect
 *
 * Vision modes are set to "ethereal" for ethereal actors, "basic" for others.
 *
 * Relevant wiki pages:
 * - [Token Sizes](https://wiki.teriock.com/index.php/Core:Size)
 * - [Vision Modes](https://wiki.teriock.com/index.php/Condition:Ethereal)
 *
 * @param {TeriockBaseActorData} system - The actor's base data system object
 * @returns {Promise<void>} Resolves when all tokens are updated
 *
 * @example
 * // Update all tokens for an actor that changed size or ethereal status
 * await prepareTokens(actor.system);
 */
async function prepareTokens(system) {
  const actor = system.parent;
  const tokens = actor?.getDependentTokens();
  const tokenSizes = {
    Tiny: 0.5,
    Small: 1,
    Medium: 1,
    Large: 2,
    Huge: 3,
    Gargantuan: 4,
    Colossal: 6,
  };
  for (const token of tokens) {
    const tokenSize = tokenSizes[system?.namedSize] || 1;
    const tokenParameters = {
      width: tokenSize,
      height: tokenSize,
    };
    if (token.width !== tokenSize || token.height !== tokenSize) {
      await token.update(tokenParameters);
    }

    let visionMode = "basic";

    if (system.senses.dark > 0) {
      visionMode = "darkvision";
    }
    if (system.senses.night > 0 && system.senses.night >= system.senses.dark) {
      visionMode = "lightAmplification";
    }
    if (system.senses.blind + system.senses.hearing + system.senses.smell > 0) {
      const maxTremor = Math.max(system.senses.blind, system.senses.hearing, system.senses.smell);
      const maxDark = Math.max(system.senses.dark, system.senses.night);
      if (maxTremor > maxDark) {
        visionMode = "tremorsense";
      }
    }
    if (actor?.statuses?.has("ethereal")) {
      visionMode = "ethereal";
    }
    if (actor?.statuses?.has("ethereal") && actor?.statuses?.has("invisible")) {
      visionMode = "invisibleEthereal";
    }

    await token.updateVisionMode(visionMode);
  }
}

/**
 * Checks if the actor should be unconscious or dead and updates the status effects accordingly.
 *
 * Relevant wiki pages:
 * - [Down](https://wiki.teriock.com/index.php/Condition:Down)
 * - [Dead](https://wiki.teriock.com/index.php/Condition:Dead)
 * - [Unconscious](https://wiki.teriock.com/index.php/Condition:Unconscious)
 *
 * @param {TeriockBaseActorData} system - The actor's base data system object
 * @returns {Promise<void>} Resolves when the status effects are updated
 */
async function checkDown(system) {
  let shouldBeAsleep = system.parent.statuses.has("asleep");
  let shouldBeUnconscious = system.hp.value <= 0 || system.mp.value <= 0 || shouldBeAsleep;
  if (system.resistances.effects.has("unconscious")) {
    shouldBeUnconscious = false;
  }
  if (system.immunities.effects.has("unconscious")) {
    shouldBeUnconscious = false;
  }
  let shouldBeDead = system.hp.value <= system.hp.min || system.mp.value <= system.mp.min;
  if (system.resistances.effects.has("dead")) {
    shouldBeDead = false;
  }
  if (system.immunities.effects.has("dead")) {
    shouldBeDead = false;
  }
  if (system.parent.statuses.has("ethereal") && shouldBeUnconscious) {
    shouldBeDead = true;
  }
  if (shouldBeDead) {
    shouldBeUnconscious = false;
    shouldBeAsleep = false;
  }
  try {
    await system.parent.toggleStatusEffect("dead", {
      active: shouldBeDead,
      overlay: true,
    });
  } catch {
    /* empty */
  }
  try {
    await system.parent.toggleStatusEffect("asleep", {
      active: shouldBeAsleep,
      overlay: true,
    });
  } catch {
    /* empty */
  }
  try {
    await system.parent.toggleStatusEffect("unconscious", {
      active: shouldBeUnconscious && !system.parent.statuses.has("asleep"),
      overlay: true,
    });
  } catch {
    /* empty */
  }
}

/**
 * If a creature is ethereal and down, it is killed.
 *
 * Relevant wiki pages:
 * - [Ethereal](https://wiki.teriock.com/index.php/Condition:Ethereal)
 * - [Down](https://wiki.teriock.com/index.php/Condition:Down)
 * - [Dead](https://wiki.teriock.com/index.php/Condition:Dead)
 *
 * @param {TeriockBaseActorData} system - The actor's base data system object
 * @returns {Promise<void>} Resolves when death status is applied (if applicable)
 *
 * @example
 * // Check if an ethereal creature should be killed due to being down
 * await etherealKill(actor.system);
 */
async function etherealKill(system) {
  const actor = system.parent;
  const down = actor?.statuses?.has("down");
  const ethereal = actor?.statuses?.has("ethereal");
  const dead = actor?.statuses?.has("dead");
  if (down && ethereal && !dead) {
    await actor.toggleStatusEffect("dead", { active: true });
    await actor.toggleStatusEffect("asleep", { active: false });
    await actor.toggleStatusEffect("unconscious", { active: false });
  }
}

/**
 * Checks and processes expiration for all effects on the actor.
 *
 * @param {TeriockBaseActorData} system - The actor's base data system object
 * @returns {Promise<void>} Resolves when all expiration checks are complete
 *
 * @example
 * // Check for expired effects on an actor
 * await checkExpirations(actor.system);
 */
async function checkExpirations(system) {
  const actor = system.parent;
  for (const effect of actor.conditionExpirationEffects) {
    await effect.system.checkExpiration();
  }
}
