//noinspection JSUnresolvedReference
const tablesPack = game.packs.get("teriock.tables");
const tables = await tablesPack.getDocuments({ name__ne: null });
for (const table of tables) {
  if (!table.formula || table.formula.length === 0) {
    await table.normalize();
  }
}
