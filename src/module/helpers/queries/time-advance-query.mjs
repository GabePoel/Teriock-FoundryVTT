/**
 * Query that gets the {@link TeriockUser} to advance game time.
 * @param {Teriock.QueryData.TimeAdvance} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function timeAdvanceQuery(queryData, { _timeout }) {
  await game.time.advance(queryData.delta);
}
