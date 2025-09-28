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
      await actor.system.takeUnhack(part);
    }
  }
  // Remove all conditions.
  for (const status of actor.statuses) {
    await actor.toggleStatusEffect(status, false);
  }
  // Restore all hit dice and mana dice
  const toUpdate = [];
  for (const rank of actor.ranks) {
    toUpdate.push({
      _id: rank.id,
      [rank.system.hpDie.path + ".spent"]: false,
      [rank.system.mpDie.path + ".spent"]: false,
    });
  }
  for (const species of actor.species) {
    const speciesUpdates = { _id: species.id };
    for (const hpDie of Object.values(species.system.hpDice)) {
      speciesUpdates[hpDie.path + ".spent"] = false;
    }
    for (const mpDie of Object.values(species.system.mpDice)) {
      speciesUpdates[mpDie.path + ".spent"] = false;
    }
    toUpdate.push(speciesUpdates);
  }
  await actor.updateEmbeddedDocuments("Item", toUpdate);
  ui.notifications.success(`Fully healed ${actor.name}.`);
} else {
  ui.notifications.warn("No actor selected.");
}
