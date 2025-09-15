/**
 * Relevant wiki pages:
 * - [Awaken](https://wiki.teriock.com/index.php/Keyword:Awaken)
 *
 * @param {TeriockBaseActorModel} actorData
 * @returns {Promise<void>}
 */
export async function _takeAwaken(actorData) {
  if (actorData.parent.statuses.has("unconscious") && !actorData.parent.statuses.has("dead")) {
    if (actorData.hp.value <= 0) {
      await actorData.parent.update({ "system.hp.value": 1 });
    }
    if (actorData.parent.statuses.has("asleep")) {
      await actorData.parent.toggleStatusEffect("asleep", { active: false });
    }
    if (actorData.parent.statuses.has("unconscious")) {
      await actorData.parent.toggleStatusEffect("unconscious", {
        active: false,
      });
    }
  }
}

/**
 * Relevant wiki pages:
 * - [Revival Effects](https://wiki.teriock.com/index.php/Category:Revival_effects)
 *
 * @param {TeriockBaseActorModel} actorData
 * @returns {Promise<void>}
 */
export async function _takeRevive(actorData) {
  if (actorData.parent.statuses.has("dead")) {
    if (actorData.hp.value <= 0) {
      await actorData.parent.takeHeal(1 - actorData.hp.value);
    }
    if (actorData.mp.value <= 0) {
      await actorData.parent.takeRevitalize(1 - actorData.mp.value);
    }
    await actorData.parent.toggleStatusEffect("dead", { active: false });
    const toRemove = actorData.parent.consequences
      .filter((c) => c.statuses.has("dead")).map((c) => c.id);
    await actorData.parent.deleteEmbeddedDocuments("ActiveEffect", toRemove);
  }
}
