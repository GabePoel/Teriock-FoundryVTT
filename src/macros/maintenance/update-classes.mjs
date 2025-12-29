const classPack = game.teriock.packs.classes;
const classFolders = classPack.folders;
const classJournal = await fromUuid(
  "Compendium.teriock.rules.JournalEntry.oVIOjeytcScUC2QJ",
);

const powers = await tm.resolve.resolveDocuments(
  classPack.index.contents.filter((i) => i.type === "power"),
);
await Promise.all(powers.map((p) => p.system.refreshFromCompendiumSource()));

const validArchetypes = Object.entries(TERIOCK.options.rank).filter(
  ([_, archetypeObj]) =>
    ["Mage", "Semi", "Warrior"].includes(archetypeObj.name),
);

await tm.utils.progressBar(
  validArchetypes,
  "Processing Archetypes...",
  async ([archetype, archetypeObj]) => {
    let archetypeFolder = classFolders.getName(archetypeObj.name);
    if (!archetypeFolder) {
      archetypeFolder = await Folder.create(
        { name: archetypeObj.name, type: "Item" },
        { pack: "teriock.classes" },
      );
    }

    const classes = Object.entries(archetypeObj.classes);

    await tm.utils.progressBar(
      classes,
      `Processing ${archetypeObj.name} Classes...`,
      async ([className, classObj]) => {
        let classFolder = classFolders.getName(classObj.name);
        if (!classFolder) {
          classFolder = await Folder.create(
            { name: classObj.name, type: "Item", folder: archetypeFolder.id },
            { pack: "teriock.classes" },
          );
        }

        const rankPromises = [];
        const rankNames = [];

        for (let r = 1; r < 6; r++) {
          const name = `Rank ${r} ${classObj.name}`;
          rankNames.push(name);

          rankPromises.push(
            (async () => {
              await classPack.getIndex();
              /** @type {TeriockRank} */
              let rankItem = classPack.index.find((e) => e.name === name);
              if (rankItem) rankItem = await fromUuid(rankItem.uuid);

              if (!rankItem) {
                rankItem = await game.teriock.Item.create(
                  {
                    name,
                    type: "rank",
                    folder: classFolder.id,
                    system: {
                      archetype: archetype,
                      className: className,
                      classRank: r,
                    },
                  },
                  { pack: "teriock.classes" },
                );
              }
              await rankItem.system.wikiPull({ notify: false });
            })(),
          );
        }

        await Promise.all(rankPromises);

        const classPage = classJournal.pages.getName(classObj.name);
        const rankUuids = rankNames
          .map((n) => classPack.index.find((e) => e.name === n)?.uuid)
          .filter((n) => n);

        const rankText = rankUuids
          .map((u) => `<p>@Embed[${u} panel noBlocks]</p>`)
          .join(``);
        const archetypeText = `<p>@Embed[${classPack.index.getName(tm.string.toTitleCase(archetype)).uuid} panel]</p>`;
        const flaws = (await fromUuid(rankUuids[0]))?.system.flaws;

        const text = tm.string.dedent(`
          ${TERIOCK.content.classes[className]}${flaws ? `\n<h2>Flaws</h2>\n${flaws}` : ""}
          <h2>Archetype</h2>
          <p>Every ${archetype} class gets the following power.</p>
          ${archetypeText}
          <h2>Ranks</h2>
          <p>For ranks 3, 4, and 5, choose one combat ability and one support ability to gain at each rank.</p>
          ${rankText}`);

        await classPage.update({ "text.content": text });
        await classPage.setFlag(
          "teriock",
          "journalImage",
          tm.path.getImage("classes", classObj.name),
        );
        await classPage.setFlag(
          "teriock",
          "journalIcon",
          TERIOCK.options.rank[archetype].classes[className].icon,
        );
      },
    );
  },
);
