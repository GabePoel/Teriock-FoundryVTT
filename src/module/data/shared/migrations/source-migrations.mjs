const PACKS = ["properties", "abilities"];
const PACK_MAP = Object.fromEntries(
  PACKS.map((id) => [
    `Compendium.teriock.${id}.Item.`,
    `Compendium.teriock.${id}.ActiveEffect.`,
  ]),
);

/**
 * Migrate a UUID.
 * @param {UUID<*>} uuid
 * @returns {UUID<*>}
 */
export function migrateUuid(uuid) {
  for (const [preItem, preEffect] of Object.entries(PACK_MAP)) {
    if (uuid?.startsWith(preItem)) {
      const remaining = uuid.slice(preItem.length);
      const id = remaining.slice(0, 16);
      return `${preEffect}${id}`;
    }
  }
  return uuid;
}
