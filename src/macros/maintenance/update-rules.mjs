const coreRulesPack = game.teriock.packs.rules();

const namespaceCategoryMap = {
  Core: "Core rules",
  Keyword: "Keywords",
  Damage: "Damage types",
  Drain: "Drain types",
  Condition: "Conditions",
  Property: "Properties",
  Tradecraft: "Tradecrafts",
};

for (const [ namespace, category ] of Object.entries(namespaceCategoryMap)) {
  console.log(`Processing namespace: ${namespace} (category: ${category})`);

  // Fetch all pages in the category
  let allRulesPages = await teriock.helpers.wiki.fetchCategoryMembers(category);
  allRulesPages = allRulesPages.filter((page) => page.title.startsWith(`${namespace}:`));

  // Attempt to load the journal from the pack
  let rulesJournal = await foundry.utils.fromUuid(coreRulesPack.index.getName(namespace)?.uuid ?? "");

  // Create the journal if it's missing
  if (!rulesJournal) {
    console.warn(`Journal for namespace '${namespace}' not found. Creating it...`);
    rulesJournal = await JournalEntry.implementation.create({ name: namespace }, { pack: "teriock.rules" });
  }

  for (const rulesPage of allRulesPages) {
    const title = rulesPage.title;

    // Extract rule name after the namespace prefix
    const rulesName = title.slice(namespace.length + 1).trim();
    if (!rulesName) {
      console.warn(`Skipping page with empty rule name: "${title}"`);
      continue;
    }

    // Fetch and clean HTML
    let rawHtml = await teriock.helpers.wiki.fetchWikiPageHTML(title, {
      transformDice: true,
      enrichText: true,
      removeSubContainers: true,
    });
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    // Remove unwanted elements
    const selectorsToRemove = [
      "figure",
      "#toc",
      ".mw-editsection-bracket",
      ".mw-editsection-visualeditor",
      ".citizen-editsection-icon",
      ".mw-ui-icon-wikimedia-edit",
      ".mw-editsection-divider",
      ".mw-file-description",
      ".mw-default-size",
    ];
    selectorsToRemove.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((el) => el.remove());
    });

    const html = doc.body.innerHTML;

    // Create or update journal page
    let journalPage = rulesJournal.pages.getName(rulesName);

    if (!journalPage) {
      await rulesJournal.createEmbeddedDocuments("JournalEntryPage", [
        {
          name: rulesName,
          type: "text",
          text: { content: html },
        },
      ]);
      console.log(`Created: ${namespace}:${rulesName}`);
    } else {
      await journalPage.update({
        text: { content: html },
      });
      console.log(`Updated: ${namespace}:${rulesName}`);
    }
  }
}
