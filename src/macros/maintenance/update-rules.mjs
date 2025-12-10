const namespaceCategoryMap = {
  Core: "Core rules",
  Keyword: "Keywords",
  Damage: "Damage types",
  Drain: "Drain types",
  Condition: "Conditions",
  Property: "Properties",
  Tradecraft: "Tradecrafts",
};

await tm.utils.progressBar(
  Object.entries(namespaceCategoryMap),
  "Pulling Rules",
  async ([namespace, category]) => {
    let allRulesPages =
      await teriock.helpers.wiki.fetchCategoryMembers(category);
    allRulesPages = allRulesPages.filter((page) =>
      page.title.startsWith(`${namespace}:`),
    );

    if (namespace === "Core") {
      allRulesPages = allRulesPages.filter((p) => !p.title.includes("Routine"));
    }

    let rulesJournal = await fromUuid(
      game.teriock.packs.rules.index.getName(namespace)?.uuid ?? "",
    );
    if (!rulesJournal) {
      rulesJournal = await JournalEntry.implementation.create(
        { name: namespace },
        { pack: "teriock.rules" },
      );
    }

    await tm.utils.progressBar(
      allRulesPages,
      `Pulling ${namespace} Rules`,
      async (rulesPage) => {
        const title = rulesPage.title;
        const rulesName = title.slice(namespace.length + 1).trim();
        if (!rulesName) return;

        const rawHtml = await teriock.helpers.wiki.fetchWikiPageHTML(title, {
          transformDice: true,
          enrichText: true,
          removeSubContainers: true,
        });

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, "text/html");

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
          ".metadata",
        ];
        selectorsToRemove.forEach((s) =>
          doc.querySelectorAll(s).forEach((el) => el.remove()),
        );

        doc.querySelectorAll("p").forEach((p) => {
          if (!p.innerHTML.replace(/&nbsp;|\s/g, "")) p.remove();
        });

        doc.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
          if (el.textContent.includes("Routine")) el.remove();
        });

        const html = doc.body.innerHTML;
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
        } else {
          await journalPage.update({ text: { content: html } });
        }

        let icon, image;
        if (namespace === "Tradecraft") {
          icon = TERIOCK.options.document.fluency.icon;
          image = tm.path.getImage("tradecrafts", journalPage.name);
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
            icon = "star";
            const imgName =
              journalPage.name === "Presence"
                ? "Unused Presence"
                : journalPage.name;
            image = tm.path.getImage("attributes", imgName);
          }
        } else if (namespace === "Keyword") {
          if (
            ["Hexproof", "Hexseal", "Immunity", "Resistance"].includes(
              journalPage.name,
            )
          ) {
            icon = "shield-halved";
            image = tm.path.getImage("effect-types", journalPage.name);
          }
        } else if (namespace === "Damage") {
          icon = "heart-crack";
          image = tm.path.getImage("damage-types", journalPage.name);
        } else if (namespace === "Drain") {
          icon = "droplet-slash";
          image = tm.path.getImage("drain-types", journalPage.name);
        } else if (namespace === "Condition") {
          icon = TERIOCK.options.document.condition.icon;
          image = tm.path.getImage("conditions", journalPage.name);
        }

        if (icon) await journalPage.setFlag("teriock", "journalIcon", icon);
        else await journalPage.unsetFlag("teriock", "journalIcon");

        if (image) await journalPage.setFlag("teriock", "journalImage", image);
        else await journalPage.unsetFlag("teriock", "journalImage");
      },
      { batch: 25 },
    );

    const toUpdate = rulesJournal.pages.contents
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((page, i) => ({ _id: page.id, sort: i * 1000 }));

    if (toUpdate.length)
      await rulesJournal.updateEmbeddedDocuments("JournalEntryPage", toUpdate);
  },
);
