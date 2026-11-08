/**
 * Query that takes a command for some actors.
 * @param {Teriock.Queries.TakeCommandData} queryData
 * @returns {Promise<void>}
 */
export default async function takeCommandQuery(queryData) {
  const actors = await Promise.all(queryData.uuids.map(uuid => fromUuid(uuid)));
  await game.teriock.commands.take(queryData.key, actors.filter(Boolean));
}
