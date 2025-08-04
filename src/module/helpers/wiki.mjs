/**
 * Opens a wiki page in a new browser tab.
 * @param {string} title - The title of the wiki page to open.
 */
export function openWikiPage(title) {
  const baseWikiUrl = "https://wiki.teriock.com";
  const pageUrl = `${baseWikiUrl}/index.php/${encodeURIComponent(title)}`;
  window.open(pageUrl, "_blank");
}

/**
 * Fetches the raw content of a wiki page via the MediaWiki API.
 * @param {string} title - The title of the wiki page to fetch.
 * @returns {Promise<string|null>} The raw wiki content as a string, or null if the request fails.
 */
export async function fetchWikiPageContent(title) {
  const endpoint = "https://wiki.teriock.com/api.php";

  const params = new URLSearchParams({
    action: "query",
    prop: "revisions",
    rvprop: "content",
    format: "json",
    origin: "*",
    titles: title,
  });

  const url = `${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];

    return page.revisions?.[0]?.slots?.main["*"] || page.revisions?.[0]["*"];
  } catch (error) {
    console.error("Error fetching page:", title, error);
  }
}

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
 * @param {boolean} [transformDice] - Should dice be converted to inline rolls?
 * @param {boolean} [removeSubContainers] - Should sub containers be removed?
 * @returns {Promise<string|null>} The cleaned HTML content as a string, or null if the request fails.
 */
export async function fetchWikiPageHTML(
  title,
  transformDice = false,
  removeSubContainers = false,
) {
  const endpoint = "https://wiki.teriock.com/api.php";
  const baseWikiUrl = "https://wiki.teriock.com";

  const enricherKeys = [
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

  const needsUuidCheck = new Set([
    "Core",
    "Keyword",
    "Condition",
    "Property",
    "Damage",
    "Drain",
    "Ability",
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
      console.error("No parsed HTML found:", data);
      return null;
    }

    const html = data.parse.text["*"];
    const doc = parseHTML(html);

    if (transformDice) {
      doc.querySelectorAll(".dice").forEach((el) => {
        const fullRoll = el.getAttribute("data-full-roll");
        if (fullRoll) el.textContent = `[[/roll ${fullRoll}]]`;
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
      }

      if (!titleAttr) {
        if (isWikiLink) {
          const pageName = decodeURIComponent(
            href.split("/index.php/")[1] || "",
          ).replace(/_/g, " ");
          const display = textContent || pageName;
          const enricherTag = `@Wiki[${pageName}]{${display}}`;
          link.replaceWith(document.createTextNode(enricherTag));
        }
        continue;
      }

      const [type, ...rest] = titleAttr.split(":");
      const fileName = rest.join(":").trim();

      if (!type || !fileName) continue;

      if (enricherKeys.includes(type)) {
        let enriched = false;

        if (needsUuidCheck.has(type)) {
          try {
            const packIndex = game.teriock.packs.rules().index.getName(type);
            const pack = await game.teriock.api.utils.fromUuid(packIndex.uuid);
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
      } else if (isWikiLink) {
        const pageName = decodeURIComponent(
          href.split("/index.php/")[1] || "",
        ).replace(/_/g, " ");
        const display = textContent || pageName;
        const enricherTag = `@Wiki[${pageName}]{${display}}`;
        link.replaceWith(document.createTextNode(enricherTag));
      }
    }

    return cleanWikiHTML(doc.body.innerHTML);
  } catch (error) {
    console.error("Error fetching HTML:", error);
    return null;
  }
}

/**
 * Cleans and processes HTML content from the wiki by removing comments and extracting the main content.
 * @param {string} html - The raw HTML content to clean.
 * @returns {Promise<string>} The cleaned HTML content.
 */
export async function cleanWikiHTML(html) {
  let doc;

  if (typeof window === "undefined") {
    // Node.js
    const { JSDOM } = await import("jsdom");
    doc = new JSDOM(html).window.document;
  } else {
    // Browser
    doc = new DOMParser().parseFromString(html, "text/html");
  }

  const container = doc.querySelector(".mw-parser-output");
  if (!container) return "";

  const removeComments = (node) => {
    for (let child of Array.from(node.childNodes)) {
      if (child.nodeType === 8) {
        node.removeChild(child);
      } else if (child.nodeType === 1) {
        removeComments(child);
      }
    }
  };

  removeComments(container);
  return container.innerHTML.trim();
}

/**
 * Fetches all members of a wiki category via the MediaWiki API.
 * @param {string} category - The name (without namespace) of the category to fetch members from.
 * @returns {Promise<Array>} An array of category member objects, or an empty array if the request fails.
 */
export async function fetchCategoryMembers(category) {
  const endpoint = "https://wiki.teriock.com/api.php";
  const LIMIT = 500;
  let members = [];
  let cmcontinue = null;

  try {
    do {
      const params = new URLSearchParams({
        action: "query",
        list: "categorymembers",
        cmtitle: `Category:${category}`,
        cmlimit: LIMIT,
        format: "json",
        origin: "*",
      });

      if (cmcontinue) {
        params.append("cmcontinue", cmcontinue);
      }

      const url = `${endpoint}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.query?.categorymembers) {
        members.push(...data.query.categorymembers);
      }

      cmcontinue = data.continue?.cmcontinue;
    } while (cmcontinue);

    return members;
  } catch (error) {
    console.error("Error fetching category members:", category, error);
    return [];
  }
}

/**
 * Fetches all pages in a given namespace via the MediaWiki API.
 * @param {string} namespace - The namespace name to fetch pages from (e.g., "Main", "Talk", "User", "Template",
 *   "Category", etc.).
 * @returns {Promise<Array>} An array of page objects, or an empty array if the request fails.
 */
export async function fetchNamespacePages(namespace) {
  const endpoint = "https://wiki.teriock.com/api.php";
  const LIMIT = 500;
  let pages = [];
  let apcontinue = null;

  try {
    do {
      const params = new URLSearchParams({
        action: "query",
        list: "allpages",
        apnamespace: namespace,
        aplimit: LIMIT,
        format: "json",
        origin: "*",
      });

      if (apcontinue) {
        params.append("apcontinue", apcontinue);
      }

      const url = `${endpoint}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.query?.allpages) {
        pages.push(...data.query.allpages);
      }

      apcontinue = data.continue?.apcontinue;
    } while (apcontinue);

    return pages;
  } catch (error) {
    console.error("Error fetching namespace pages:", namespace, error);
    return [];
  }
}

/**
 * Fetches all ability names within a wiki category via the MediaWiki API.
 *
 * @param {string} category - The name (without namespace) of the category to fetch from.
 * @returns {Promise<string[]>} An array of names of member pages.
 */
export async function fetchCategoryAbilities(category) {
  let pages = await fetchCategoryMembers(category);
  pages = pages.filter((page) => page.title.includes("Ability:"));
  return pages.map((page) => page.title.split("Ability:")[1]);
}
