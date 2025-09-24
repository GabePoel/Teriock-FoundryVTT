/**
 * Performs post-update operations for a Teriock actor's base data.
 * This function orchestrates several important maintenance tasks that should
 * occur after the actor's data has been updated:
 *
 * 2. **Token Preparation**: Updates token sizes and vision modes to match actor state
 * 3. **Down Checks**: Set whatever type of "down" is appropriate
 * 5. **Expiration Monitoring**: Checks and processes expiration effects
 *
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object
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
      const { visionMode, range } = token.deriveVision();
      const tokenLight = token.light;
      const newTokenLight = foundry.utils.mergeObject(
        tokenLight,
        actorData.light,
      );
      const tokenUpdateData = {};
      if (!foundry.utils.objectsEqual(tokenLight, newTokenLight)) {
        tokenUpdateData["light"] = actorData.light;
      }
      if (token.sight.range !== range) {
        tokenUpdateData["range"] = range;
      }
      if (token.width !== actorData.size.length) {
        tokenUpdateData["width"] = actorData.size.length;
      }
      if (token.height !== actorData.size.length) {
        tokenUpdateData["height"] = actorData.size.length;
      }
      if (Object.keys(tokenUpdateData).length > 0) {
        await token.update(tokenUpdateData);
      }
      if (token.sight.visionMode !== visionMode) {
        await token.updateVisionMode(visionMode);
      }
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
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object
 * @returns {Promise<void>} Resolves when the status effects are updated
 */
async function checkDown(actorData) {
  // Handle financial damage
  if (actorData.parent.statuses.has("down") && actorData.money.debt > 0) {
    if (
      !(
        actorData.protections.resistances.statuses.has("hollied") ||
        actorData.protections.immunities.statuses.has("hollied") ||
        actorData.protections.hexproofs.statuses.has("hollied") ||
        actorData.protections.hexseals.statuses.has("hollied")
      )
    ) {
      try {
        await actorData.parent.toggleStatusEffect("hollied", { active: true });
      } catch {}
    }
    if (
      !(
        actorData.protections.resistances.statuses.has("terrored") ||
        actorData.protections.immunities.statuses.has("terrored") ||
        actorData.protections.hexproofs.statuses.has("terrored") ||
        actorData.protections.hexseals.statuses.has("terrored")
      )
    ) {
      try {
        await actorData.parent.toggleStatusEffect("terrored", { active: true });
      } catch {}
    }
  }
}

/**
 * Checks and processes expiration for all effects on the actor.
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object
 * @returns {Promise<void>} Resolves when all expiration checks are complete
 */
async function checkExpirations(actorData) {
  const actor = actorData.parent;
  for (const effect of actor.conditionExpirationEffects) {
    await effect.system.checkExpiration();
  }
}
