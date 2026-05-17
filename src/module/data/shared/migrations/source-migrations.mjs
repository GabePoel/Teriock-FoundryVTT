const { hasProperty, setProperty, deleteProperty, getProperty } = foundry.utils;

const PACKS = ["properties", "abilities"];
const PACK_MAP = Object.fromEntries(
  PACKS.map(id => [`Compendium.teriock.${id}.Item.`, `Compendium.teriock.${id}.ActiveEffect.`]),
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

/**
 * Migrate some property's key.
 * @param {object} source
 * @param {string} oldKey
 * @param {string} newKey
 * @param {(val) => *} [transform]
 */
export function migrateKey(source, oldKey, newKey, transform = val => val) {
  if (hasProperty(source, oldKey) && !hasProperty(source, newKey)) {
    setProperty(source, transform(newKey), getProperty(source, oldKey));
  }
  deleteProperty(source, oldKey);
}

/**
 * Migrate some property's value.
 * @param {object} source
 * @param {string} key
 * @param {string} oldVal
 * @param {string} newVal
 */
export function migrateValue(source, key, oldVal, newVal) {
  if (getProperty(source, key) === oldVal) setProperty(source, key, newVal);
}

/**
 * Migrate some property's value using a transform function.
 * @param {object} source
 * @param {string} key
 * @param {(val) => *} transform
 */
export function migrateValueTransform(source, key, transform) {
  if (getProperty(source, key)) {
    setProperty(source, key, transform(getProperty(source, key)));
  }
}
