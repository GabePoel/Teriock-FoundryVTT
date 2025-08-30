const toRemove = [];
await actor.takeSetTempHp(0);
actor.consequences.map((c) => {
  if (c.name === "Brace Effect") {
    toRemove.push(c.id);
  }
});
if (toRemove.length > 0) {
  await actor.deleteEmbeddedDocuments("ActiveEffect", toRemove);
}
