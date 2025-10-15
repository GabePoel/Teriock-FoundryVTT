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
 * @returns {Promise<void>} Resolves when all post-update operations are complete
 * @private
 */
export async function _postUpdate(actorData) {
  await checkExpirations(actorData);
  for (const token of /** @type {TeriockTokenDocument[]} */ actorData.parent.getDependentTokens()) {
    await token.postActorUpdate();
  }
  if (game.settings.get("teriock", "synchronizeSpeciesSizeWithActor")) {
    await synchronizeSize(actorData);
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

/**
 * Updates the sizes for species on the actor.
 * @param {TeriockBaseActorModel} actorData
 * @returns {Promise<void>}
 */
async function synchronizeSize(actorData) {
  const species = actorData.parent.species;
  const updates = [];
  for (const s of species) {
    if (
      Object.values(s.system.sizeStepAbilities).length > 0 &&
      actorData.size.number.value !== s.system.size.value
    ) {
      updates.push({
        _id: s.id,
        "system.size.value": actorData.size.number.value,
      });
    }
  }
  if (updates.length > 0) {
    await actorData.parent.updateEmbeddedDocuments("Item", updates);
  }
}
