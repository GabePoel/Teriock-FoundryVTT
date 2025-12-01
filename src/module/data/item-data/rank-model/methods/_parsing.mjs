import { getRankIcon } from "../../../../helpers/path.mjs";
import { ensureChildren } from "../../../../helpers/utils.mjs";
import { cleanObject } from "../../../shared/parsing/clean-html-doc.mjs";

/**
 * Default stats for different archetypes.
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
 * @param {TeriockRankModel} rankData - The rank data to parse content for.
 * @param {string} rawHTML - The raw HTML content to parse.
 * @returns {Promise<object>} Promise that resolves to the parsed parent data.
 * @private
 */
export async function _parse(rankData, rawHTML) {
  const { className, classRank, archetype } = rankData;
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

  let abilitiesToCreate = [];

  // Create abilities
  for (const rank of [0, 1, 2]) {
    if (classRank === rank) {
      for (const name of rankNames[rank]) {
        abilitiesToCreate.push(name);
      }
    }
  }
  if (classRank >= 3) {
    rankNames["3c"].sort((a, b) => a.localeCompare(b));
    rankNames["3s"].sort((a, b) => a.localeCompare(b));
    for (const name of rankNames["3c"]) {
      abilitiesToCreate.push(name);
    }
    for (const name of rankNames["3s"]) {
      abilitiesToCreate.push(name);
    }
  }

  const progress = ui.notifications.info(`Pulling Rank from wiki.`, {
    progress: true,
  });

  const results = await ensureChildren(
    rankData.parent,
    "ability",
    abilitiesToCreate,
  );

  // Update progress to show processing has started
  progress.update({
    pct: 0.1,
    message: `Creating ${abilitiesToCreate.length} abilities in parallel...`,
  });

  // Execute all ability creation in parallel
  try {
    const a3c = rankData.parent.abilities.filter((a) =>
      rankNames["3c"].includes(a.name),
    );
    const a3s = rankData.parent.abilities.filter((a) =>
      rankNames["3s"].includes(a.name),
    );
    await Promise.all(
      a3c.map((a) => a.setFlag("teriock", "category", "combat")),
    );
    await Promise.all(
      a3s.map((a) => a.setFlag("teriock", "category", "support")),
    );
    await a3c
      .find((a) => a.name === rankNames["3c"][classRank - 3])
      ?.setFlag("teriock", "defaultAbility", true);
    await a3s
      .find((a) => a.name === rankNames["3s"][classRank - 3])
      ?.setFlag("teriock", "defaultAbility", true);

    const toDelete = rankData.parent.abilities
      .filter((a) => !abilitiesToCreate.includes(a.name))
      .map((a) => a._id);
    await rankData.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);

    // Update progress to completion
    progress.update({
      pct: 0.9,
      message: `Successfully created ${results.length} abilities.`,
    });

    console.log(
      `Created abilities for rank:`,
      results.map((r) => r.nameString),
    );
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
    flaws: getHTML(".class-flaws") || "",
    description: getHTML(".class-description") || "",
    statDice: {
      hp: {
        "number.saved": "1",
        faces: ARCHETYPE_FACES[archetype]["hp"],
      },
      mp: {
        "number.saved": "1",
        faces: ARCHETYPE_FACES[archetype]["mp"],
      },
    },
  };

  let name = `Rank ${classRank} ${classValue}`;
  if (name.includes("Journeyman")) {
    name = "Journeyman";
  }

  progress.update({ pct: 1 });

  cleanObject(
    parameters,
    ["description", "flaws"],
    TERIOCK.index.classes[rankData.className],
  );

  return {
    system: parameters,
    img: getRankIcon(rankData.className, rankData.classRank),
    name: name,
  };
}
