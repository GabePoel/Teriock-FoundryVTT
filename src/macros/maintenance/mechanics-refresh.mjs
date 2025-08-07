const essentialsPack = game.teriock.packs.essentials();

let actorMechanics = essentialsPack.index.find(
  (m) => m.name === "Actor Mechanics",
);
actorMechanics = await foundry.utils.fromUuid(actorMechanics.uuid);

const existingMechanics = actor.itemTypes?.mechanic || [];
const existingMechanicIds = existingMechanics.map((m) => m.id);

if (existingMechanics.length > 0) {
  await actor.deleteEmbeddedDocuments(
    "Item",
    existingMechanicIds
  );
}

await actor.createEmbeddedDocuments("Item", [actorMechanics]);