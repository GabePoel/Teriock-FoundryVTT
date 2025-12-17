/**
 * Query that asks a {@link TeriockAbility} to sustain a {@link TeriockConsequence}.
 * @param {Teriock.QueryData.AddToSustaining} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function addToSustainingQuery(queryData, { _timeout }) {
  const sustainingAbility = await fromUuid(queryData.sustainingUuid);
  if (sustainingAbility) {
    const sustainedUuids = Array.from(sustainingAbility.system.sustaining);
    sustainedUuids.push(...queryData.sustainedUuids);
    await sustainingAbility.update({ "system.sustaining": sustainedUuids });
  }
}
