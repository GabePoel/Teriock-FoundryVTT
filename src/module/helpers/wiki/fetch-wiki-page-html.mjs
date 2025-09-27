import cleanWikiHTML from "./clean-wiki-html.mjs";

let isNode = typeof window === "undefined";

let parseHTML;

if (isNode) {
  // Node.js: Use jsdom
  const { JSDOM } = await import("jsdom");
  parseHTML = (html) => new JSDOM(html).window.document;
} else {
  // Browser: Use DOMParser
  parseHTML = (html) => new DOMParser().parseFromString(html, "text/html");
}

/**
 * Fetches the parsed HTML content of a wiki page via the MediaWiki API.
 * @param {string} title - The title of the wiki page to fetch.
 * @param {object} [options] - Options.
 * @param {boolean} [options.transformDice] - Should dice be converted to inline rolls?
 * @param {boolean} [options.removeSubContainers] - Should sub containers be removed?
 * @param {boolean} [options.enrichText] - Should text enrichments be applied?
 * @param {boolean} [options.noSubs] - Remove all sub and expandable content.
 * @param {boolean} [options.simplifyWikiLinks] - Replace wiki links with enriched equivalents.
 * @param {boolean} [options.cleanSpans] - Replace spans with plain text.
 * @returns {Promise<string|null>} The cleaned HTML content as a string, or null if the request fails.
 */
export default async function fetchWikiPageHTML(title, options = {}) {
  const endpoint = "https://wiki.teriock.com/api.php";
  const baseWikiUrl = "https://wiki.teriock.com";

  const {
    transformDice = false,
    removeSubContainers = false,
    enrichText = false,
    noSubs = false,
    simplifyWikiLinks = true,
    cleanSpans = false,
  } = options;

  let enricherKeys = [];

  if (enrichText) {
    enricherKeys = [
      "Core",
      "Class",
      "Keyword",
      "Damage",
      "Drain",
      "Condition",
      "Property",
      "Tradecraft",
      "Ability",
      "Equipment",
    ];
  }

  const needsUuidCheck = new Set([
    "Core",
    "Keyword",
    "Condition",
    "Property",
    "Damage",
    "Drain",
  ]);

  const params = new URLSearchParams({
    action: "parse",
    page: title,
    format: "json",
    origin: "*",
    prop: "text",
  });

  const url = `${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.parse?.text) {
      console.error("No parsed HTML found:", title, data);
      return null;
    }

    const html = data.parse.text["*"];
    let domDocument;
    if (isNode) {
      const { JSDOM } = await import("jsdom");
      const dom = new JSDOM(html);
      const { document } = dom.window;
      domDocument = document;
    }
    const doc = parseHTML(html);

    if (transformDice) {
      doc.querySelectorAll(".dice").forEach((el) => {
        const fullRoll = el.getAttribute("data-full-roll");
        if (fullRoll) {
          el.textContent = `[[/roll ${fullRoll}]]`;
        }
      });
    }

    if (removeSubContainers) {
      doc
        .querySelectorAll(".ability-sub-container")
        .forEach((el) => el.remove());
    }

    const links = doc.querySelectorAll("a");

    for (const link of links) {
      const href = link.getAttribute("href");
      const titleAttr = link.getAttribute("title");
      const textContent = link.textContent || "";
      const isWikiLink = href?.startsWith("/index.php/");
      if (isWikiLink) {
        link.setAttribute("href", baseWikiUrl + href);
        link.setAttribute("target", "_blank");
        if (titleAttr && simplifyWikiLinks) {
          const display = textContent || titleAttr;
          const enricherTag = `@L[${titleAttr}]{${display}}`;
          if (isNode) {
            link.replaceWith(domDocument.createTextNode(enricherTag));
          } else {
            link.replaceWith(document.createTextNode(enricherTag));
          }
          continue;
        }
      }

      if (!titleAttr) {
        if (isWikiLink && enrichText) {
          const pageName = decodeURIComponent(
            href.split("/index.php/")[1] || "",
          ).replace(/_/g, " ");
          const display = textContent || pageName;
          const enricherTag = `@Wiki[${pageName}]{${display}}`;
          if (isNode) {
            link.replaceWith(domDocument.createTextNode(enricherTag));
          } else {
            link.replaceWith(document.createTextNode(enricherTag));
          }
        }
        continue;
      }

      const [type, ...rest] = titleAttr.split(":");
      const fileName = rest.join(":").trim();

      if (!type || !fileName) {
        continue;
      }

      if (enricherKeys.includes(type)) {
        let enriched = false;

        if (needsUuidCheck.has(type)) {
          try {
            const packIndex = game.teriock.packs.rules().index.getName(type);
            const pack = await foundry.utils.fromUuid(packIndex.uuid);
            if (pack) {
              const page = pack.pages.getName(fileName);
              if (page?.uuid) {
                const enricherTag = `@${type}[${fileName}]{${textContent}}`;
                link.replaceWith(document.createTextNode(enricherTag));
                enriched = true;
              }
            }
          } catch (err) {
            console.warn(`${type} UUID check failed for: ${fileName}`, err);
          }
        } else {
          const enricherTag = `@${type}[${fileName}]{${textContent}}`;
          link.replaceWith(document.createTextNode(enricherTag));
          enriched = true;
        }

        if (!enriched && isWikiLink) {
          const pageName = decodeURIComponent(
            href.split("/index.php/")[1] || "",
          ).replace(/_/g, " ");
          const display = textContent || pageName;
          const enricherTag = `@Wiki[${pageName}]{${display}}`;
          link.replaceWith(document.createTextNode(enricherTag));
        }
      } else if (isWikiLink && enrichText) {
        const pageName = decodeURIComponent(
          href.split("/index.php/")[1] || "",
        ).replace(/_/g, " ");
        const display = textContent || pageName;
        const enricherTag = `@Wiki[${pageName}]{${display}}`;
        link.replaceWith(document.createTextNode(enricherTag));
      }
    }

    if (cleanSpans) {
      [...doc.querySelectorAll("span")]
        .reverse()
        .forEach((s) => s.replaceWith(s.textContent));
    }

    return cleanWikiHTML(doc.body.innerHTML, { noSubs });
  } catch (error) {
    console.error("Error fetching HTML:", title, error);
    return null;
  }
}
