const toRemove = [];
const consequences = actor.effectTypes?.consequence || [];
await actor.takeSetTempHp(0);
consequences.map((c) => {
  if (c.name === "Brace Effect") {
    toRemove.push(c.id);
  }
});
if (toRemove.length > 0) {
  await actor.deleteEmbeddedDocuments("ActiveEffect", toRemove);
}
