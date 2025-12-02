/**
 * Get a {@link TeriockItem} from a {@link CompendiumCollection}.
 * @param {string} name - Name of the {@link TeriockItem}.
 * @param {string} pack - Key corresponding to some {@link CompendiumCollection}.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockItem}.
 * @returns {Promise<TeriockItem|null>}
 */
export async function getDocument(name, pack, options = {}) {
  if (!pack.includes(".")) {
    pack = `teriock.${pack}`;
  }
  const packs = game.packs;
  const compendium = packs.get(pack);
  const uuid = compendium?.index.getName(name).uuid;
  try {
    const item = await fromUuid(uuid);
    if (item && options.clone) {
      return item.clone();
    }
    return item;
  } catch (error) {
    console.error(name, pack, error);
  }
}

/**
 * Copy a {@link TeriockItem} from a {@link CompendiumCollection}.
 * @param {string} name - Name of the {@link TeriockItem}.
 * @param {string} pack - Key corresponding to some {@link CompendiumCollection}.
 * @returns {Promise<TeriockItem|null>}
 */
export async function copyItem(name, pack) {
  return await getDocument(name, pack, { clone: true });
}

/**
 * Get a {@link TeriockAbility} from a {@link CompendiumCollection}.
 * @param {string} name - Name of the {@link TeriockAbility}.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockAbility}.
 * @returns {Promise<TeriockAbility>}
 */
export async function getAbility(name, options = {}) {
  const item = await getDocument(name, "abilities", options);
  return item.system.effect;
}

/**
 * Get a {@link TeriockProperty} from a {@link CompendiumCollection}.
 * @param {string} name - Name of the {@link TeriockProperty}.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockProperty}.
 * @returns {Promise<TeriockProperty>}
 */
export async function getProperty(name, options = {}) {
  const item = await getDocument(name, "properties", options);
  return item.effects.getName(name);
}

/**
 * Get a {@link TeriockRank} from the default {@link CompendiumCollection}.
 * @param {string} classKey - Key for the class of the {@link TeriockRank}.
 * @param {number} number - Number of the {@link TeriockRank} in the class.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockRank}.
 * @returns {Promise<TeriockRank|null>}
 */
export async function getRank(classKey, number, options = {}) {
  if (
    number > 5 ||
    number < 1 ||
    !Object.keys(TERIOCK.index.classes).includes(classKey)
  ) {
    return null;
  }
  const name = `Rank ${number} ${TERIOCK.index.classes[classKey]}`;
  return await getDocument(name, "classes", options);
}

/**
 * Copy a {@link TeriockRank} from the default {@link CompendiumCollection}.
 * @param {string} classKey - Key for the class of the {@link TeriockRank}.
 * @param {number} number - Number of the {@link TeriockRank} in the class.
 * @returns {Promise<TeriockRank|null>}
 */
export async function copyRank(classKey, number) {
  return await getRank(classKey, number, { clone: true });
}
