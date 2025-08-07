const essentialsPack = game.teriock.packs.essentials();

let actorMechanics = essentialsPack.index.find(
  (m) => m.name === "Actor Mechanics",
);

actorMechanics = await foundry.utils.fromUuid(actorMechanics.uuid);

for (const effect of actorMechanics.transferredEffects) {
  if (effect.statuses.has("down")) {
    await effect.setFlag("core", "overlay", true);
  }
}