/**
 * Performs post-update operations for a Teriock actor's base data.
 * This function orchestrates several important maintenance tasks that should
 * occur after the actor's data has been updated:
 *
 * 2. **Token Preparation**: Updates token sizes and vision modes to match actor state
 * 3. **Down Checks**: Set whatever type of "down" is appropriate
 * 5. **Expiration Monitoring**: Checks and processes expiration effects
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object
 * @param {Teriock.Parameters.Actor.SkipFunctions} skipFunctions - Functions that should be skipped
 * @returns {Promise<void>} Resolves when all post-update operations are complete
 * @private
 */
export async function _postUpdate(actorData, skipFunctions = {}) {
  if (!skipFunctions.checkDown) {
    await checkDown(actorData);
  }
  if (!skipFunctions.checkExpirations) {
    await checkExpirations(actorData);
  }
  if (!skipFunctions.prepareTokens) {
    for (const token of /** @type {TeriockTokenDocument[]} */ actorData.parent.getDependentTokens()) {
      const {
        visionMode,
        range,
      } = token.deriveVision();
      await token.update({
        light: actorData.light,
        "sight.range": range,
      });
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
 * @param {TeriockBaseActorData} actorData - The actor's base data system object
 * @returns {Promise<void>} Resolves when the status effects are updated
 */
async function checkDown(actorData) {
  // Handle financial damage
  if (actorData.parent.statuses.has("down") && actorData.money.debt > 0) {
    if (!(actorData.resistances.effects.has("hollied") || actorData.immunities.effects.has("hollied"))) {
      try {
        await actorData.parent.toggleStatusEffect("hollied", { active: true });
      } catch {}
    }
    if (!(actorData.resistances.effects.has("terrored") || actorData.immunities.effects.has("terrored"))) {
      try {
        await actorData.parent.toggleStatusEffect("terrored", { active: true });
      } catch {}
    }
  }
}

/**
 * Checks and processes expiration for all effects on the actor.
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object
 * @returns {Promise<void>} Resolves when all expiration checks are complete
 *
 * @example
 * ```js
 * // Check for expired effects on an actor
 * await checkExpirations(actor.system);
 * ```
 */
async function checkExpirations(actorData) {
  const actor = actorData.parent;
  for (const effect of actor.conditionExpirationEffects) {
    await effect.system.checkExpiration();
  }
}
