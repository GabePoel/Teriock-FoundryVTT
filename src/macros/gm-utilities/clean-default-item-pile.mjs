/** @type {TeriockActor} */
const defaultItemPile = game.actors.getName("Default Item Pile");
if (defaultItemPile) {
  await defaultItemPile.deleteEmbeddedDocuments("Item", defaultItemPile.items.map((i) => i.id));
}
