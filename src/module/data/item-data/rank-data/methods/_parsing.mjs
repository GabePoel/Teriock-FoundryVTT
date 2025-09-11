import { createAbility } from "../../../../helpers/create-effects.mjs";
import { getRankIcon } from "../../../../helpers/path.mjs";
import { cleanObject } from "../../../shared/parsing/clean-html-doc.mjs";

/**
 * Default statistics for different archetypes.
 *
 * @type {object}
 * @private
 */
const ARCHETYPE_FACES = {
  mage: {
    hp: 8,
    mp: 12,
  },
  warrior: {
    hp: 12,
    mp: 8,
  },
  semi: {
    hp: 10,
    mp: 10,
  },
  everyman: {
    hp: 10,
    mp: 10,
  },
};

/**
 * Extracts ability names from metadata attributes.
 * Splits comma-separated values and filters out empty strings.
 * @param {Element} metaData - The metadata element to extract from.
 * @param {string} attr - The attribute name to extract.
 * @returns {string[]} Array of ability names.
 * @private
 */
function extractAbilityNames(metaData, attr) {
  const val = metaData.getAttribute(attr);
  return val ? val
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean) : [];
}

/**
 * Parses raw HTML content for a rank, extracting class information and abilities.
 * Creates abilities based on class rank and updates the rank with parsed data.
 * @param {TeriockRankData} rankData - The rank data to parse content for.
 * @param {string} rawHTML - The raw HTML content to parse.
 * @returns {Promise<object>} Promise that resolves to the parsed parent data.
 * @private
 */
export async function _parse(rankData, rawHTML) {
  const {
    className,
    classRank,
    archetype,
  } = rankData;
  const classValue = TERIOCK.options.rank[archetype].classes[className].name;
  // const toDelete = rankData.parent.abilities.map((a) => a.id);
  // await rankData.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);

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
  for (const rank of [
    0,
    1,
    2,
  ]) {
    if (classRank === rank) {
      for (const name of rankNames[rank]) {
        toCreate.push(name);
      }
    }
  }
  if (classRank >= 3) {
    for (const name of rankNames["3c"]) {
      toCreate.push(name);
    }
    for (const name of rankNames["3s"]) {
      toCreate.push(name);
    }
  }

  const progress = ui.notifications.info(`Pulling Rank from wiki.`, {
    progress: true,
  });

  /**
   * Creates a single ability
   * @param {string} abilityName - The name of the ability to create
   * @returns {Promise<Object>} Promise that resolves with ability creation result
   */
  async function createSingleAbility(abilityName) {
    let ability = rankData.parent.getAbilities().find((a) => a.name === abilityName);
    if (ability) {
      await ability.system.wikiPull({ notify: false });
    } else {
      await createAbility(rankData.parent, abilityName, { notify: false });
    }
    return {
      abilityName,
      success: true,
    };
  }

  // Create an array of promises for parallel processing
  const abilityPromises = toCreate.map((abilityName) => createSingleAbility(abilityName));

  // Update progress to show processing has started
  progress.update({
    pct: 0.1,
    message: `Creating ${toCreate.length} abilities in parallel...`,
  });

  // Execute all ability creation in parallel
  try {
    const results = await Promise.all(abilityPromises);

    const toDelete = rankData.parent.getAbilities().filter((a) => !toCreate.includes(a.name)).map((a) => a.id);
    await rankData.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);

    // Update progress to completion
    progress.update({
      pct: 0.9,
      message: `Successfully created ${results.length} abilities.`,
    });

    console.log(`Created abilities for rank:`, results.map((r) => r.abilityName));
  } catch (error) {
    progress.update({
      pct: 0.9,
      message: `Error occurred during ability creation: ${error.message}`,
    });
    console.error("Error creating abilities:", error);
    throw error;
  }

  // Helper for HTML/text extraction
  const getHTML = (sel) => doc.querySelector(sel)?.innerHTML.trim();

  const parameters = {
    maxAv: metaData.getAttribute("data-av"),
    archetype: metaData.getAttribute("data-archetype"),
    flaws: getHTML(".class-flaws") || "None.",
    description: getHTML(".class-description") || "",
    hpDiceBase: {
      number: 1,
      faces: ARCHETYPE_FACES[archetype]["hp"],
    },
    mpDiceBase: {
      number: 1,
      faces: ARCHETYPE_FACES[archetype]["mp"],
    },
  };

  let name = `Rank ${classRank} ${classValue}`;
  if (name.includes("Journeyman")) {
    name = "Journeyman";
  }

  progress.update({ pct: 1 });

  cleanObject(parameters, [
    "description",
    "flaws",
  ]);

  return {
    system: parameters,
    img: getRankIcon(rankData.className, rankData.classRank),
    name: name,
  };
}
