/**
 * Query that runs a command for some actors.
 * @param {Teriock.Queries.RunCommandData} queryData
 * @returns {Promise<void>}
 */
export default async function runCommandQuery(queryData) {
  const actors = await Promise.all(queryData.uuids.map(uuid => fromUuid(uuid)));
  await game.teriock.commands.run(queryData.key, actors.filter(Boolean));
}
