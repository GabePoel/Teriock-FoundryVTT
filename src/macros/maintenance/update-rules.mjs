const coreRulesPack = game.teriock.packs.rules;

const namespaceCategoryMap = {
  Core: "Core rules",
  Keyword: "Keywords",
  Damage: "Damage types",
  Drain: "Drain types",
  Condition: "Conditions",
  Property: "Properties",
  Tradecraft: "Tradecrafts",
};

for (const [namespace, category] of Object.entries(namespaceCategoryMap)) {
  console.log(`Processing namespace: ${namespace} (category: ${category})`);

  // Fetch all pages in the category
  let allRulesPages = await teriock.helpers.wiki.fetchCategoryMembers(category);
  allRulesPages = allRulesPages.filter((page) =>
    page.title.startsWith(`${namespace}:`),
  );

  // Attempt to load the journal from the pack
  let rulesJournal = await fromUuid(
    coreRulesPack.index.getName(namespace)?.uuid ?? "",
  );

  // Create the journal if it's missing
  if (!rulesJournal) {
    console.warn(
      `Journal for namespace '${namespace}' not found. Creating it...`,
    );
    rulesJournal = await JournalEntry.implementation.create(
      { name: namespace },
      { pack: "teriock.rules" },
    );
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
      journalPage = (
        await rulesJournal.createEmbeddedDocuments("JournalEntryPage", [
          {
            name: rulesName,
            type: "text",
            text: { content: html },
          },
        ])
      )[0];
      console.log(`Created: ${namespace}:${rulesName}`);
    } else {
      await journalPage.update({
        text: { content: html },
      });
      console.log(`Updated: ${namespace}:${rulesName}`);
    }

    if (namespace === "Tradecraft") {
      await journalPage.setFlag(
        "teriock",
        "journalImage",
        tm.path.getImage("tradecrafts", journalPage.name),
      );
      await journalPage.setFlag(
        "teriock",
        "journalIcon",
        TERIOCK.options.document.fluency.icon,
      );
    } else if (namespace === "Core") {
      if (
        [
          "Movement",
          "Intelligence",
          "Perception",
          "Sneak",
          "Strength",
          "Presence",
        ].includes(journalPage.name)
      ) {
        let iconName = journalPage.name;
        if (iconName === "Presence") {
          iconName = "Unused Presence";
        }
        await journalPage.setFlag(
          "teriock",
          "journalImage",
          tm.path.getImage("attributes", iconName),
        );
        await journalPage.setFlag("teriock", "journalIcon", "star");
      } else if (namespace === "Damage") {
        await journalPage.setFlag(
          "teriock",
          "journalImage",
          tm.path.getImage("damage-types", journalPage.name),
        );
        await journalPage.setFlag("teriock", "journalIcon", "droplet-slash");
      } else if (namespace === "Drain") {
        await journalPage.setFlag(
          "teriock",
          "journalImage",
          tm.path.getImage("drain-types", journalPage.name),
        );
        await journalPage.setFlag("teriock", "journalIcon", "heart-crack");
      } else {
        await journalPage.unsetFlag("teriock", "journalImage");
        await journalPage.unsetFlag("teriock", "journalIcon");
      }
    }

    let pages = 0;
    const toUpdate = [];
    for (const page of rulesJournal.pages.contents.sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      toUpdate.push({
        _id: page.id,
        sort: pages * 1000,
      });
      pages++;
    }
    await rulesJournal.updateEmbeddedDocuments("JournalEntryPage", toUpdate);
  }
}
