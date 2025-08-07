const essentialsPack = game.teriock.packs.essentials();

let actorMechanics = essentialsPack.index.find(
  (m) => m.name === "Actor Mechanics",
);

actorMechanics = await foundry.utils.fromUuid(actorMechanics.uuid);

await actorMechanics.sheet.render(true);