/**
 * Performs post-update operations for a Teriock actor's base data.
 * This function orchestrates several important maintenance tasks that should
 * occur after the actor's data has been updated:
 *
 * 2. **Token Preparation**: Updates token sizes and vision modes to match actor state
 * 3. **Down Checks**: Set whatever type of "down" is appropriate
 * 5. **Expiration Monitoring**: Checks and processes expiration effects
 *
 * @param {TeriockBaseActorData} system - The actor's base data system object
 * @param {Teriock.Parameters.Actor.SkipFunctions} skipFunctions - Functions that should be skipped
 * @returns {Promise<void>} Resolves when all post-update operations are complete
 * @private
 */
export async function _postUpdate(system, skipFunctions = {}) {
  if (!skipFunctions.checkDown) {
    await checkDown(system);
  }
  if (!skipFunctions.checkExpirations) {
    await checkExpirations(system);
  }
  if (!skipFunctions.prepareTokens) {
    for (const token of /** @type {TeriockTokenDocument[]} */ system.parent.getDependentTokens()) {
      const { visionMode, range } = token.deriveVision();
      await token.update({ light: system.light, "sight.range": range });
      await token.updateVisionMode(visionMode);
    }
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
  // Handle financial damage
  if (system.parent.statuses.has("down") && system.money.debt > 0) {
    if (
      !(
        system.resistances.effects.has("hollied") ||
        system.immunities.effects.has("hollied")
      )
    ) {
      try {
        await system.parent.toggleStatusEffect("hollied", { active: true });
      } catch {}
    }
    if (
      !(
        system.resistances.effects.has("terrored") ||
        system.immunities.effects.has("terrored")
      )
    ) {
      try {
        await system.parent.toggleStatusEffect("terrored", { active: true });
      } catch {}
    }
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
