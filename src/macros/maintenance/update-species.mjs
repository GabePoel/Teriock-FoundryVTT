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

let allSpeciesPages =
  await game.teriock.api.wiki.fetchCategoryMembers("Creatures");
allSpeciesPages = allSpeciesPages.filter((page) =>
  page.title.includes("Creature:"),
);

async function processSpecies(speciesPage, _index, _total) {
  const speciesName = speciesPage.title.split("Creature:")[1];

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

  return { speciesName, success: true };
}

const speciesPromises = allSpeciesPages.map((speciesPage, index) =>
  processSpecies(speciesPage, index, allSpeciesPages.length),
);

progress.update({
  pct: 0.1,
  message: `Processing ${allSpeciesPages.length} species in parallel...`,
});

try {
  const results = await Promise.all(speciesPromises);

  progress.update({
    pct: 1,
    message: `Successfully processed ${results.length} species.`,
  });

  console.log(
    `Completed processing ${results.length} species:`,
    results.map((r) => r.speciesName),
  );
} catch (error) {
  progress.update({
    pct: 1,
    message: `Error occurred during processing: ${error.message}`,
  });
  console.error("Error processing species:", error);
}
