import { rollButtons } from "../../../constants/display/buttons.mjs";

/**
 * Remove sub-containers and convert .dice spans into enricher rolls.
 * Uses ROLL_BUTTON_CONFIGS when data-type matches; otherwise falls back to /roll.
 * @param {Document} doc
 * @returns {Document}
 */
export function cleanHTMLDoc(doc) {
  doc
    .querySelectorAll(
      ".ability-sub-container, .expandable-container, .expandable-table",
    )
    .forEach((el) => el.remove());

  const TYPE_LUT = Object.fromEntries(
    Object.keys(rollButtons).map((k) => [k.toLowerCase(), k]),
  );

  doc.querySelectorAll(".dice").forEach((el) => {
    const fullRoll = el.getAttribute("data-full-roll");
    const quickRoll = el.getAttribute("data-quick-roll");
    const typeAttr = el.getAttribute("data-type") || "";
    const canonical = TYPE_LUT[typeAttr.toLowerCase()] || null;
    const formula = (fullRoll || quickRoll || "").trim();
    if (!formula) {
      return;
    }
    const tagType = canonical || "roll";
    el.textContent = `[[/${tagType} ${formula}]]`;
  });

  return doc;
}

/**
 * @param {string} html
 * @returns {string}
 */
function cleanDoubleLineBreaks(html) {
  while (html.includes("\n")) {
    html = html.replace("\n", "");
  }
  return html;
}

/**
 * @param {string} html
 * @returns {string}
 */
export function cleanHTML(html) {
  const doc = document.createElement("div");
  doc.innerHTML = html;
  const links = doc.querySelectorAll("a");
  for (const link of links) {
    const href = link.getAttribute("href");
    const titleAttr = link.getAttribute("title");
    const textContent = link.textContent || "";
    const isWikiLink = href?.includes("wiki.teriock.com");
    if (isWikiLink) {
      if (titleAttr) {
        const display = textContent || titleAttr;
        const enricherTag = `@L[${titleAttr}]{${display}}`;
        link.replaceWith(document.createTextNode(enricherTag));
      }
    }
  }
  const tables = doc.querySelectorAll(
    "[data-replace-table='true'], div.metadata",
  );
  for (const table of tables) {
    const tableName = table.getAttribute("data-table-name");
    if (tableName) {
      const tablesPack = game.teriock.packs.tables;
      const rollableTable = tablesPack.index.getName(tableName);
      if (rollableTable) {
        const enricherTag = ` @Embed[${rollableTable.uuid}]`;
        table.replaceWith(enricherTag);
      }
    }
  }
  [...doc.querySelectorAll("span")]
    .reverse()
    .forEach((s) => s.replaceWith(s.textContent));
  let out = cleanDoubleLineBreaks(doc.innerHTML);
  if (!out.startsWith("<p>")) {
    out = `<p>${out}</p>`;
  }
  out = foundry.utils.cleanHTML(out);
  out = out.replace(/<p>\s*<\/p>/g, "");
  return out;
}

/**
 * @param {object} obj
 * @param {string[]} keys
 */
export function cleanObject(obj, keys) {
  for (const key of keys) {
    if (foundry.utils.getProperty(obj, key)) {
      foundry.utils.setProperty(
        obj,
        key,
        cleanHTML(foundry.utils.getProperty(obj, key)),
      );
    }
  }
}
