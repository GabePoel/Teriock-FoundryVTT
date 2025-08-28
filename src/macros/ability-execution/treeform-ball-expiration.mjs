const args = scope.args;
if (
  args[0].name === "Treeform Ball Effect" &&
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
      "system.disabled": false,
    };
  });
  const rankUpdates = actor.ranks.map((r) => {
    return {
      _id: r.id,
      "system.disabled": false,
    };
  });
  await actor.updateEmbeddedDocuments("Item", [
    ...speciesUpdates,
    ...rankUpdates,
  ]);
  await actor.update({ "system.hp.value": hp });
  await actor.unsetFlag("teriock", "preTransformHp");
}
