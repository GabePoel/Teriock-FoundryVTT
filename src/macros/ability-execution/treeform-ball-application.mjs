if (!actor.effectKeys.consequence.has("treeformBallEffect")) {
  const hp = actor.system.hp.value;
  if (!actor.itemKeys.species.has("tree")) {
    const data = /** @type {Teriock.HookData.EffectApplication} */ scope.data;
    const uuid = data.docData.system.transformation.uuid;
    const treeSpecies = await fromUuid(uuid);
    const treeData = /** @type {TeriockSpecies} */ foundry.utils.deepClone(
      treeSpecies.toObject(),
    );
    treeData.system.transformationLevel =
      data.docData.system.transformation.level;
    treeData.system.size.value = actor.system.size.number.value;
    await actor.createEmbeddedDocuments("Item", [treeData]);
  }
  const notTree = actor.species.filter((s) => s.name !== "Tree");
  for (const i of [...notTree, ...actor.ranks]) {
    await i.setFlag(
      "teriock",
      "preTreeformApplyHp",
      !i.system.statDice.hp.disabled,
    );
    await i.setFlag("teriock", "preTreeformDisabled", i.disabled);
  }
  const disabledSpeciesArray = notTree.map((s) => {
    return {
      _id: s.id,
      "system.statDice.hp.disabled": true,
      "system.disabled": true,
    };
  });
  const disabledRanksArray = actor.ranks.map((r) => {
    return {
      _id: r.id,
      "system.statDice.hp.disabled": true,
      "system.disabled": true,
    };
  });
  const itemsToDisable = [...disabledSpeciesArray, ...disabledRanksArray];
  await actor.updateEmbeddedDocuments("Item", itemsToDisable);
  await actor.setFlag("teriock", "preTransformHp", hp);
  await actor.update({ "system.hp.value": actor.system.hp.max });
}
