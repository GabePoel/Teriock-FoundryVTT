import { rollButtons } from "../../../constants/display/buttons.mjs";

/**
 * Remove sub-containers and convert .dice spans into enricher rolls.
 * Uses ROLL_BUTTON_CONFIGS when data-type matches; otherwise falls back to /roll.
 * @param {Document} doc
 * @returns {Document}
 */
export function cleanHTMLDoc(doc) {
  doc = cleanHTMLSubs(doc);
  doc = cleanHTMLDice(doc);
  return doc;
}

/**
 * Remove sub-containers.
 * @param {Document} doc
 * @returns {Document}
 */
export function cleanHTMLSubs(doc) {
  doc
    .querySelectorAll(
      ".ability-sub-container, .expandable-container, .expandable-table",
    )
    .forEach((el) => el.remove());
  return doc;
}

/**
 * Turn dice into something enrichable.
 * @param {Document} doc
 * @returns {Document}
 */
export function cleanHTMLDice(doc) {
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
 * @param {string} [name]
 * @param {object} [options]
 * @param {boolean} [options.useFoundry]
 * @returns {string}
 */
export function cleanHTML(html, name, { useFoundry = true }) {
  const doc = document.createElement("div");
  doc.innerHTML = html;
  if (name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedName, "g");
    const walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (node.parentElement && node.parentElement.closest("a")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && regex.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(regex, "[[lookup name]]");
      }
    }
  }
  const links = doc.querySelectorAll("a");
  for (const link of links) {
    const href = link.getAttribute("href");
    const titleAttr = link.getAttribute("title");
    const textContent = link.textContent || "";
    const isWikiLink = href?.includes("wiki.teriock.com");
    if (isWikiLink && titleAttr) {
      const display = textContent || titleAttr;
      const enricherTag = `@L[${titleAttr}]{${display}}`;
      link.replaceWith(document.createTextNode(enricherTag));
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
        table.replaceWith(document.createTextNode(enricherTag));
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
  if (useFoundry) {
    out = foundry.utils.cleanHTML(out);
  }
  out = out.replace(/<p>\s*<\/p>/g, "");
  return out;
}

/**
 * @param {object} obj
 * @param {string[]} keys
 * @param {string} [name]
 */
export function cleanObject(obj, keys, name) {
  for (const key of keys) {
    if (foundry.utils.getProperty(obj, key)) {
      foundry.utils.setProperty(
        obj,
        key,
        cleanHTML(foundry.utils.getProperty(obj, key), name),
      );
    }
  }
}
