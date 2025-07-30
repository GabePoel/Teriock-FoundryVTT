/**
 * Query that asks a {@link TeriockAbility} to sustain a {@link TeriockConsequence}.
 *
 * @param {Teriock.QueryAddToSustainingData} queryData
 * @param {{timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function addToSustainingQuery(queryData, { timeout }) {
  const sustainingAbility = await game.teriock.api.utils.fromUuid(
    queryData.sustainingUuid,
  );
  if (sustainingAbility) {
    const sustainedUuids = sustainingAbility.system.sustaining;
    for (const uuid of queryData.sustainedUuids) {
      sustainedUuids.add(uuid);
    }
    await sustainingAbility.update({ "system.sustaining": sustainedUuids });
  }
}
