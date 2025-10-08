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
  if (!skipFunctions.checkExpirations) {
    await checkExpirations(actorData);
  }
  if (!skipFunctions.prepareTokens) {
    for (const token of /** @type {TeriockTokenDocument[]} */ actorData.parent.getDependentTokens()) {
      await token.postActorUpdate();
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
