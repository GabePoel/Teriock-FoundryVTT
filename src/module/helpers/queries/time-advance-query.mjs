/**
 * Query that gets the {@link TeriockUser} to advance game time.
 *
 * @param {Teriock.QueryTimeAdvanceData} queryData
 * @param {{timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function timeAdvanceQuery(queryData, { timeout }) {
  await game.time.advance(queryData.delta);
}
