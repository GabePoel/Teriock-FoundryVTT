if (actor) {
  // Set HP and MP to max.
  await actor.update({
    "system.hp.value": actor.system.hp.max,
    "system.mp.value": actor.system.mp.max,
    "system.attackPenalty": 0,
    "system.hasReaction": true,
  });
  // Remove all hacks.
  for (const [part, value] of Object.entries(actor.system.hacks)) {
    for (let i = 0; i < value.max; i++) {
      await actor.takeUnhack(part);
    }
  }
  // Remove all conditions.
  for (const status of actor.statuses) {
    await actor.toggleStatusEffect(status, false);
  }
  // Restore all hit dice and mana dice
  const ranksToUpdate = [];
  for (const rank of actor.ranks) {
    ranksToUpdate.push({
      _id: rank.id,
      "system.hitDieSpent": false,
      "system.manaDieSpent": false,
    });
  }
  await actor.updateEmbeddedDocuments("Item", ranksToUpdate);
  ui.notifications.success(`Fully healed ${actor.name}.`);
} else {
  ui.notifications.warn("No actor selected.");
}
