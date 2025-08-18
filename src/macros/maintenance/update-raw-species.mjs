const speciesPack = game.teriock.packs.species();
const speciesFolders = speciesPack.folders;

const allSpeciesFolderName = "All Species";
let allSpeciesFolder = speciesFolders.getName(allSpeciesFolderName);
if (!allSpeciesFolder) {
  await Folder.create(
    {
      name: allSpeciesFolderName,
      type: "Item",
    },
    {
      pack: "teriock.species",
    },
  );
}

const progress = ui.notifications.info("Pulling all creatures from wiki.", {
  progress: true,
});
let pct = 0;

let allSpeciesPages =
  await game.teriock.api.wiki.fetchCategoryMembers("Creatures");
allSpeciesPages = allSpeciesPages.filter((page) =>
  page.title.includes("Creature:"),
);
for (const speciesPage of allSpeciesPages) {
  const speciesName = speciesPage.title.split("Creature:")[1];

  pct += 1 / allSpeciesPages.length;
  progress.update({ pct: pct, message: `Pulling ${speciesName} from wiki.` });

  let speciesItem = speciesPack.index.find((e) => e.name === speciesName);
  if (!speciesItem) {
    speciesItem = await game.teriock.Item.create(
      {
        name: speciesName,
        type: "species",
        folder: allSpeciesFolder.id,
      },
      { pack: "teriock.species" },
    );
  } else {
    speciesItem = await foundry.utils.fromUuid(speciesItem.uuid);
  }
  await speciesItem.system.wikiPull({ notify: false });
}
