import { getRankImage } from "../../../../helpers/path.mjs";
import { ensureChildren } from "../../../../helpers/resolve.mjs";
import { cleanObject } from "../../../shared/parsing/clean-html-doc.mjs";

function extractAbilityNames(metaData, attr) {
  const val = metaData.getAttribute(attr);
  return val
    ? val
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];
}

export async function _parse(rankData, rawHTML) {
  const { className, classRank, archetype } = rankData;
  const classValue = TERIOCK.options.rank[archetype].classes[className].name;

  const doc = new DOMParser().parseFromString(rawHTML, "text/html");
  const metaData = doc.querySelector(".class-metadata");

  const rankNames = {
    0: extractAbilityNames(metaData, "data-r0"),
    1: extractAbilityNames(metaData, "data-r1"),
    2: extractAbilityNames(metaData, "data-r2"),
    "3c": extractAbilityNames(metaData, "data-r3c"),
    "3s": extractAbilityNames(metaData, "data-r3s"),
  };

  let abilitiesToCreate = [];

  for (const rank of [0, 1, 2]) {
    if (classRank === rank) abilitiesToCreate.push(...rankNames[rank]);
  }
  if (classRank >= 3) {
    rankNames["3c"].sort((a, b) => a.localeCompare(b));
    rankNames["3s"].sort((a, b) => a.localeCompare(b));
    abilitiesToCreate.push(...rankNames["3c"], ...rankNames["3s"]);
  }

  await ensureChildren(rankData.parent, "ability", abilitiesToCreate);

  const a3c = rankData.parent.abilities.filter((a) =>
    rankNames["3c"].includes(a.name),
  );
  const a3s = rankData.parent.abilities.filter((a) =>
    rankNames["3s"].includes(a.name),
  );

  const updates = [
    ...a3c.map((a) => ({ doc: a, cat: "combat" })),
    ...a3s.map((a) => ({ doc: a, cat: "support" })),
  ];

  if (updates.length > 0) {
    await tm.utils.progressBar(
      updates,
      "Setting Ability Categories",
      async ({ doc, cat }) => {
        await doc.setFlag("teriock", "category", cat);
      },
      10,
    );
    await a3c
      .find((a) => a.name === rankNames["3c"][classRank - 3])
      ?.setFlag("teriock", "defaultAbility", true);
    await a3s
      .find((a) => a.name === rankNames["3s"][classRank - 3])
      ?.setFlag("teriock", "defaultAbility", true);
  }

  const toDelete = rankData.parent.abilities
    .filter((a) => !abilitiesToCreate.includes(a.name))
    .map((a) => a._id);
  if (toDelete.length)
    await rankData.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);

  const getHTML = (sel) => doc.querySelector(sel)?.innerHTML.trim();

  const parameters = {
    maxAv: metaData.getAttribute("data-av"),
    archetype: metaData.getAttribute("data-archetype"),
    flaws: getHTML(".class-flaws") || "",
    description: getHTML(".class-description") || "",
    statDice: {
      hp: { "number.raw": "1", faces: TERIOCK.options.rank[archetype]["hp"] },
      mp: { "number.raw": "1", faces: TERIOCK.options.rank[archetype]["mp"] },
    },
  };

  let name = `Rank ${classRank} ${classValue}`;
  if (name.includes("Journeyman")) name = "Journeyman";

  cleanObject(parameters, ["description", "flaws"], rankData.parent.name);

  return {
    system: parameters,
    img: getRankImage(rankData.className, rankData.classRank),
    name: name,
  };
}
