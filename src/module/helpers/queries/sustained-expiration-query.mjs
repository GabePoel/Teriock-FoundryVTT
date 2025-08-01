/**
 * Query that asks a {@link TeriockConsequence} to expire.
 *
 * @param {Teriock.QuerySustainedExpirationData} queryData
 * @param {{timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function sustainedExpirationQuery(queryData, { timeout }) {
  const sustainedConsequence = await game.teriock.api.utils.fromUuid(
    queryData.sustainedUuid,
  );
  if (sustainedConsequence) {
    await sustainedConsequence.system.expire();
  }
}
