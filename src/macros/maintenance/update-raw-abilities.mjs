const essentialsPack = game.teriock.packs.essentials();
const essentialsFolders = essentialsPack.folders;

const rawAbilitiesFolderName = "Raw Abilities";
let rawAbilitiesFolder = essentialsFolders.getName(rawAbilitiesFolderName);
if (!rawAbilitiesFolder) {
  await Folder.create(
    {
      name: rawAbilitiesFolderName,
      type: "Item",
    },
    {
      pack: "teriock.essentials",
    },
  );
}

const progress = ui.notifications.info(`Pulling all abilities from wiki.`, {
  progress: true,
});

let allAbilityPages =
  await game.teriock.api.wiki.fetchCategoryMembers("Abilities");
allAbilityPages = allAbilityPages.filter((page) =>
  page.title.includes("Ability:"),
);

async function processAbility(abilityPage, _index, _total) {
  const abilityName = abilityPage.title.split("Ability:")[1];

  let abilityItem = essentialsPack.index.find((e) => e.name === abilityName);
  if (!abilityItem) {
    abilityItem = await game.teriock.Item.create(
      {
        name: abilityName,
        type: "power",
        system: {
          type: "other",
          description: `This power is a wrapper for ${abilityName}.`,
        },
        folder: rawAbilitiesFolder.id,
      },
      { pack: "teriock.essentials" },
    );
  } else {
    abilityItem = await foundry.utils.fromUuid(abilityItem.uuid);
  }

  await abilityItem.setFlag("teriock", "abilityWrapper", true);
  await abilityItem.setFlag("teriock", "effectWrapper", true);
  let abilityEffect = abilityItem.abilities.find((a) => a.name === abilityName);

  if (!abilityEffect) {
    abilityEffect = await game.teriock.api.create.ability(
      abilityItem,
      abilityName,
      { notify: false },
    );
  } else {
    await abilityEffect.system.wikiPull({ notify: false });
  }

  if (abilityItem.img !== abilityEffect.img) {
    await abilityItem.update({ img: abilityEffect.img });
  }

  return { abilityName, success: true };
}

const abilityPromises = allAbilityPages.map((abilityPage, index) =>
  processAbility(abilityPage, index, allAbilityPages.length),
);

progress.update({
  pct: 0.1,
  message: `Processing ${allAbilityPages.length} abilities in parallel...`,
});

try {
  const results = await Promise.all(abilityPromises);

  progress.update({
    pct: 1,
    message: `Successfully processed ${results.length} abilities.`,
  });

  console.log(
    `Completed processing ${results.length} abilities:`,
    results.map((r) => r.abilityName),
  );
} catch (error) {
  progress.update({
    pct: 1,
    message: `Error occurred during processing: ${error.message}`,
  });
  console.error("Error processing abilities:", error);
}
