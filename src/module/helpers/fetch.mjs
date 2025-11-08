/**
 * Get a {@link TeriockItem} from a {@link CompendiumCollection}.
 * @param {string} name - Name of the {@link TeriockItem}.
 * @param {string} pack - Key corresponding to some {@link CompendiumCollection}.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockItem}.
 * @returns {Promise<TeriockItem|null>}
 */
export async function getItem(name, pack, options = {}) {
  if (!pack.includes(".")) {
    pack = `teriock.${pack}`;
  }
  const packs =
    /** @type {Collection<string, TeriockCompendiumCollection>} */ game.packs;
  const compendium = packs.get(pack);
  try {
    const uuid = compendium.index.getName(name).uuid;
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
  return await getItem(name, pack, { clone: true });
}

/**
 * Get a {@link TeriockAbility} from a {@link CompendiumCollection}.
 * @param {string} name - Name of the {@link TeriockAbility}.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockAbility}.
 * @returns {Promise<TeriockAbility>}
 */
export async function getAbility(name, options = {}) {
  const item = await getItem(name, "abilities", options);
  return item.system.effect;
}

/**
 * Copy a {@link TeriockAbility} from the default {@link CompendiumCollection}.
 * @param {string} name - Name of the {@link TeriockAbility}.
 * @returns {Promise<TeriockAbility>}
 */
export async function copyAbility(name) {
  if (Object.keys(TERIOCK.index.abilities).includes(name)) {
    name = Object.keys(TERIOCK.index.abilities)[name];
  }
  if (!Object.values(TERIOCK.index.abilities).includes(name)) {
    return null;
  }
  return await getAbility(name, { clone: true });
}

/**
 * Import a {@link TeriockAbility} from the default {@link CompendiumCollection} to the given document.
 * @param {TeriockActor|TeriockItem} document - Document to give the {@link TeriockAbility} to.
 * @param {string} name - Name of the {@link TeriockAbility}.
 * @returns {Promise<TeriockAbility>}
 */
export async function importAbility(document, name) {
  const ability = await copyAbility(name);
  const abilities =
    /** @type {TeriockAbility[]} */
    await document.createEmbeddedDocuments("ActiveEffect", [ability]);
  await document.forceUpdate();
  return abilities[0];
}

/**
 * Get a {@link TeriockProperty} from a {@link CompendiumCollection}.
 * @param {string} name - Name of the {@link TeriockProperty}.
 * @param {object} options - Options.
 * @param {boolean} [options.clone] - Fetch a clone instead of the raw {@link TeriockProperty}.
 * @returns {Promise<TeriockProperty>}
 */
export async function getProperty(name, options = {}) {
  const item = await getItem(name, "properties", options);
  return item.effects.getName(name);
}

/**
 * Copy a {@link TeriockProperty} from the default {@link CompendiumCollection}.
 * @param {string} name - Name of the {@link TeriockProperty}.
 * @returns {Promise<TeriockProperty>}
 */
export async function copyProperty(name) {
  if (Object.keys(TERIOCK.index.properties).includes(name)) {
    name = Object.keys(TERIOCK.index.properties)[name];
  }
  if (!Object.values(TERIOCK.index.properties).includes(name)) {
    return null;
  }
  return await getProperty(name, { clone: true });
}

/**
 * Import a {@link TeriockProperty} from the default {@link CompendiumCollection} to the given document.
 * @param {TeriockActor|TeriockItem} document - Document to give the {@link TeriockProperty} to.
 * @param {string} name - Name of the {@link TeriockProperty}.
 * @returns {Promise<TeriockProperty>}
 */
export async function importProperty(document, name) {
  const property = await copyProperty(name);
  const properties =
    /** @type {TeriockProperty[]} */
    await document.createEmbeddedDocuments("ActiveEffect", [property]);
  await document.forceUpdate();
  return properties[0];
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
  return await getItem(name, "classes", options);
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
