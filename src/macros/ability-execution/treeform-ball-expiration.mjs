const data = /** @type {Teriock.HookData.EffectActivity} */ scope.data;
if (
  data.doc.name === "Treeform Ball Effect" &&
  actor.itemKeys.species.has("tree")
) {
  let hp = actor.getFlag("teriock", "preTransformHp") || 0;
  if (hp) {
    if (actor.system.hp.value < 0) {
      hp += actor.system.hp.value;
    }
  }
  const tree = actor.species.find((s) => s.name === "Tree");
  if (tree) {
    await tree.delete();
  }
  const speciesUpdates = actor.species.map((s) => {
    return {
      _id: s.id,
      "system.statDice.hp.disabled": !s.getFlag(
        "teriock",
        "preTreeformApplyHp",
      ),
      "system.disabled": s.getFlag("teriock", "preTreeformDisabled"),
    };
  });
  const rankUpdates = actor.ranks.map((r) => {
    return {
      _id: r.id,
      "system.statDice.hp.disabled": !r.getFlag(
        "teriock",
        "preTreeformApplyHp",
      ),
      "system.disabled": r.getFlag("teriock", "preTreeformDisabled"),
    };
  });
  await actor.updateEmbeddedDocuments("Item", [
    ...speciesUpdates,
    ...rankUpdates,
  ]);
  await actor.update({ "system.hp.value": hp });
  await actor.unsetFlag("teriock", "preTransformHp");
}
