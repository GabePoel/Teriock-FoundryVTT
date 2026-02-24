if (actor) {
  // Set HP and MP to max.
  await actor.update({
    "system.hp.value": actor.system.hp.max,
    "system.mp.value": actor.system.mp.max,
    "system.combat.attackPenalty": 0,
    "system.combat.hasReaction": true,
  });
  // Remove all hacks.
  for (const [part, value] of Object.entries(actor.system.hacks)) {
    for (let i = 0; i < value.max; i++) {
      await actor.system.takeUnhack(part);
    }
  }
  // Remove all conditions.
  await actor.deleteEmbeddedDocuments(
    "ActiveEffect",
    actor.conditions.map((c) => c.id),
  );
  // Restore all hit dice and mana dice
  const toUpdate = [];
  for (const item of [...actor.ranks, ...actor.species, ...actor.mounts]) {
    const itemUpdates = { _id: item.id };
    const hpDice = item.system.statDice.hp.dice.map((d) => d.toObject());
    for (const d of hpDice) {
      d.spent = false;
    }
    const mpDice = item.system.statDice.mp.dice.map((d) => d.toObject());
    for (const d of mpDice) {
      d.spent = false;
    }
    itemUpdates["system.statDice.hp.dice"] = hpDice;
    itemUpdates["system.statDice.mp.dice"] = mpDice;
    toUpdate.push(itemUpdates);
  }
  await actor.updateEmbeddedDocuments("Item", toUpdate);
  ui.notifications.success("TERIOCK.MACROS.FullHeal.success", {
    localize: true,
    format: { name: actor.name },
  });
} else {
  ui.notifications.warn("TERIOCK.DIALOGS.Common.ERRORS.noActor", {
    localize: true,
  });
}
