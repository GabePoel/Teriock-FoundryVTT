/**
 * Increases the hack level for a specific body part and applies corresponding effects.
 *
 * Relevant wiki pages:
 * - [Hacks](https://wiki.teriock.com/index.php/Condition:Hacked)
 *
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object
 * @param {Teriock.Parameters.Actor.HackableBodyPart} part - The body part to hack
 * @returns {Promise<void>} Resolves when the hack is applied and effects are updated
 */
export async function _takeHack(actorData, part) {
  let statusName = part + "Hack";
  if (["arm", "leg"].includes(part)) {
    statusName += "1";
  }
  if (!actorData.parent.statuses.has(statusName)) {
    await actorData.parent.toggleStatusEffect(statusName, { active: true });
  } else if (["arm", "leg"].includes(part)) {
    statusName = part + "Hack2";
    if (!actorData.parent.statuses.has(statusName)) {
      await actorData.parent.toggleStatusEffect(statusName, { active: true });
    }
  }
}

/**
 * Decreases the hack level for a specific body part and removes corresponding effects.
 *
 * Relevant wiki pages:
 * - [Hacks](https://wiki.teriock.com/index.php/Condition:Hacked)
 *
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object
 * @param {Teriock.Parameters.Actor.HackableBodyPart} part - The body part to unhack
 * @returns {Promise<void>} Resolves when the unhack is applied and effects are updated
 */
export async function _takeUnhack(actorData, part) {
  let statusName = part + "Hack";
  if (actorData.parent.statuses.has(statusName + "2")) {
    await actorData.parent.toggleStatusEffect(statusName + "2", {
      active: false,
    });
  } else if (actorData.parent.statuses.has(statusName + "1")) {
    await actorData.parent.toggleStatusEffect(statusName + "1", {
      active: false,
    });
  } else if (actorData.parent.statuses.has(statusName)) {
    await actorData.parent.toggleStatusEffect(statusName, { active: false });
  }
}
