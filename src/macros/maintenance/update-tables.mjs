//noinspection JSUnresolvedReference
const tablesPack = game.packs.get("teriock.tables");
const tables = await tablesPack.getDocuments({ name__ne: null });
for (const table of tables) {
  await table.normalize();
}
