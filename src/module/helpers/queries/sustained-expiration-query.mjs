/**
 * Query that asks a {@link TeriockConsequence} to expire.
 * @param {Teriock.QueryData.SustainedExpiration} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function sustainedExpirationQuery(
  queryData,
  { _timeout },
) {
  const sustainedConsequence = await foundry.utils.fromUuid(
    queryData.sustainedUuid,
  );
  if (sustainedConsequence) {
    await sustainedConsequence.system.expire();
  }
}
