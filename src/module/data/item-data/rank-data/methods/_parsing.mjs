import { createAbility } from "../../../../helpers/create-effects.mjs";

/**
 * Default statistics for different archetypes.
 *
 * @type {object}
 * @private
 */
const ARCHETYPE_STATS = {
  mage: { hitDie: "d8", manaDie: "d12", hp: 5, mp: 7 },
  warrior: { hitDie: "d12", manaDie: "d8", hp: 7, mp: 5 },
  default: { hitDie: "d10", manaDie: "d10", hp: 6, mp: 6 },
};

/**
 * Extracts ability names from metadata attributes.
 * Splits comma-separated values and filters out empty strings.
 *
 * @param {Element} metaData - The metadata element to extract from.
 * @param {string} attr - The attribute name to extract.
 * @returns {string[]} Array of ability names.
 * @private
 */
function extractAbilityNames(metaData, attr) {
  const val = metaData.getAttribute(attr);
  return val
    ? val
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];
}

/**
 * Parses raw HTML content for a rank, extracting class information and abilities.
 * Creates abilities based on class rank and updates the rank with parsed data.
 *
 * @param {TeriockRankData} rankData - The rank data to parse content for.
 * @param {string} rawHTML - The raw HTML content to parse.
 * @returns {Promise<object>} Promise that resolves to the parsed parent data.
 * @private
 */
export async function _parse(rankData, rawHTML) {
  const { className, classRank, archetype } = rankData;
  const classValue =
    CONFIG.TERIOCK.rankOptions[archetype].classes[className].name;
  const toDelete = [];

  // Remove existing abilities
  for (const effect of rankData.parent.transferredEffects.filter(
    (e) => e.type === "ability",
  )) {
    toDelete.push(effect._id);
  }

  await rankData.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);

  const doc = new DOMParser().parseFromString(rawHTML, "text/html");
  const metaData = doc.querySelector(".class-metadata");

  // Extract ability names by rank
  const rankNames = {
    0: extractAbilityNames(metaData, "data-r0"),
    1: extractAbilityNames(metaData, "data-r1"),
    2: extractAbilityNames(metaData, "data-r2"),
    "3c": extractAbilityNames(metaData, "data-r3c"),
    "3s": extractAbilityNames(metaData, "data-r3s"),
  };

  const toCreate = [];

  // Create abilities
  for (const rank of [0, 1, 2]) {
    if (classRank === rank) {
      for (const name of rankNames[rank]) toCreate.push(name);
    }
  }
  if (classRank >= 3) {
    for (const name of rankNames["3c"]) toCreate.push(name);
    for (const name of rankNames["3s"]) toCreate.push(name);
  }

  /** @type {object} */
  const progress = ui.notifications.info(`Pulling Rank from wiki.`, {
    progress: true,
  });
  let pct = 0;
  for (const abilityName of toCreate) {
    progress.update({ pct: pct, message: `Pulling ${abilityName} from wiki.` });
    await createAbility(rankData.parent, abilityName, { notify: false });
    pct += 1 / toCreate.length;
    progress.update({ pct: pct, message: `Pulling ${abilityName} from wiki.` });
  }

  // Archetype stats
  const stats = ARCHETYPE_STATS[archetype] || ARCHETYPE_STATS.default;

  // Helper for HTML/text extraction
  const getHTML = (sel) => doc.querySelector(sel)?.innerHTML.trim();

  const parameters = {
    maxAv: metaData.getAttribute("data-av"),
    archetype: metaData.getAttribute("data-archetype"),
    ...stats,
    flaws: getHTML(".class-flaws") || "None.",
    description: getHTML(".class-description") || "",
  };

  return {
    system: parameters,
    img: `systems/teriock/assets/classes/${className}.svg`,
    name: `Rank ${classRank} ${classValue}`,
  };
}
