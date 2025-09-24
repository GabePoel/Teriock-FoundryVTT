/**
 * Apply the provided changes.
 * @param {TeriockCommon | TeriockTokenDocument} doc
 * @param {Array<EffectChangeData & { effect: TeriockEffect, property: number }>} changes
 * @param {object} overrides
 */
export default function applyCertainChanges(doc, changes, overrides) {
  changes.sort((a, b) => a.priority - b.priority);

  // Apply all changes
  for (const change of changes) {
    if (!change.key) {
      continue;
    }
    const changes = change.effect.apply(doc, change);
    Object.assign(overrides, changes);
  }

  // Expand the set of final overrides
  doc.overrides = foundry.utils.expandObject(overrides);
}
