/**
 * Query that runs commands in order for some actors.
 * @param {Teriock.Queries.RunCommandData} queryData
 * @returns {Promise<void>}
 */
export default async function runCommandQuery(queryData) {
  const actors = await Promise.all(queryData.uuids.map(uuid => fromUuid(uuid)));
  for (const key of queryData.keys) { await game.teriock.commands.run(key, actors.filter(Boolean)); }
}
