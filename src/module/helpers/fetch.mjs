/**
 * Get a {@link TeriockItem} from a {@link TeriockCompendiumCollection}.
 *
 * @param {string} name - Name of the {@link TeriockItem}.
 * @param {string} pack - Key corresponding to some {@link TeriockCompendiumCollection}.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockItem}.
 * @returns {Promise<TeriockItem|null>}
 */
export async function getItem(name, pack, options = {}) {
  if (!pack.includes(".")) pack = `teriock.${pack}`;
  const packs =
    /** @type {Collection<TeriockCompendiumCollection>} */ game.packs;
  /** @type {TeriockCompendiumCollection} */
  const compendium = packs.get(pack);
  /** @type {Teriock.UUID<TeriockItem>} */
  const uuid = compendium.index.getName(name).uuid;
  const item = await foundry.utils.fromUuid(uuid);
  if (options.clone) {
    return item?.clone();
  }
  return item;
}

/**
 * Copy a {@link TeriockItem} from a {@link TeriockCompendiumCollection}.
 *
 * @param {string} name - Name of the {@link TeriockItem}.
 * @param {string} pack - Key corresponding to some {@link TeriockCompendiumCollection}.
 * @returns {Promise<TeriockItem|null>}
 */
export async function copyItem(name, pack) {
  return await getItem(name, pack, { clone: true });
}

/**
 * Get a {@link TeriockAbility} from a {@link TeriockCompendiumCollection}.
 *
 * @param {string} name - Name of the {@link TeriockAbility}.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockAbility}.
 * @returns {Promise<TeriockAbility>}
 */
export async function getAbility(name, options = {}) {
  const item = await getItem(name, "essentials", options);
  return item.effects.getName(name);
}

/**
 * Copy a {@link TeriockAbility} from the default {@link TeriockCompendiumCollection}.
 *
 * @param {string} name - Name of the {@link TeriockAbility}.
 * @returns {Promise<TeriockAbility>}
 */
export async function copyAbility(name) {
  if (Object.keys(CONFIG.TERIOCK.abilities).includes(name))
    name = Object.keys(CONFIG.TERIOCK.abilities)[name];
  if (!Object.values(CONFIG.TERIOCK.abilities).includes(name)) return null;
  return await getAbility(name, { clone: true });
}

/**
 * Import a {@link TeriockAbility} from the default {@link TeriockCompendiumCollection} to the given document.
 *
 * @param {TeriockActor|TeriockItem} document - Document to give the {@link TeriockAbility} to.
 * @param {string} name - Name of the {@link TeriockAbility}.
 * @returns {Promise<TeriockAbility>}
 */
export async function importAbility(document, name) {
  const ability = await copyAbility(name);
  const abilities =
    /** @type {TeriockAbility[]} */
    await document.createEmbeddedDocuments("ActiveEffect", [ability]);
  return abilities[0];
}

/**
 * Get a {@link TeriockProperty} from a {@link TeriockCompendiumCollection}.
 *
 * @param {string} name - Name of the {@link TeriockProperty}.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockProperty}.
 * @returns {Promise<TeriockProperty>}
 */
export async function getProperty(name, options = {}) {
  const item = await getItem(name, "essentials", options);
  return item.effects.getName(name);
}

/**
 * Copy a {@link TeriockProperty} from the default {@link TeriockCompendiumCollection}.
 *
 * @param {string} name - Name of the {@link TeriockProperty}.
 * @returns {Promise<TeriockProperty>}
 */
export async function copyProperty(name) {
  if (Object.keys(CONFIG.TERIOCK.properties).includes(name))
    name = Object.keys(CONFIG.TERIOCK.properties)[name];
  if (!Object.values(CONFIG.TERIOCK.properties).includes(name)) return null;
  return await getProperty(name, { clone: true });
}

/**
 * Import a {@link TeriockProperty} from the default {@link TeriockCompendiumCollection} to the given document.
 *
 * @param {TeriockActor|TeriockItem} document - Document to give the {@link TeriockProperty} to.
 * @param {string} name - Name of the {@link TeriockProperty}.
 * @returns {Promise<TeriockProperty>}
 */
export async function importProperty(document, name) {
  const property = await copyProperty(name);
  const properties =
    /** @type {TeriockProperty[]} */
    await document.createEmbeddedDocuments("ActiveEffect", [property]);
  return properties[0];
}

/**
 * Get a {@link TeriockRank} from the default {@link TeriockCompendiumCollection}.
 *
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
    !Object.keys(CONFIG.TERIOCK.rankOptionsList).includes(classKey)
  )
    return null;
  const name = `Rank ${number} ${CONFIG.TERIOCK.rankOptionsList[classKey]}`;
  return await getItem(name, "classes", options);
}

/**
 * Copy a {@link TeriockRank} from the default {@link TeriockCompendiumCollection}.
 *
 * @param {string} classKey - Key for the class of the {@link TeriockRank}.
 * @param {number} number - Number of the {@link TeriockRank} in the class.
 * @returns {Promise<TeriockRank|null>}
 */
export async function copyRank(classKey, number) {
  return await getRank(classKey, number, { clone: true });
}
