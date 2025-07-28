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

/** @type {object} */
const progress = ui.notifications.info(`Pulling all abilities from wiki.`, {
  progress: true,
});
let pct = 0;

let allAbilityPages =
  await game.teriock.api.wiki.fetchCategoryMembers("Abilities");
allAbilityPages = allAbilityPages.filter((page) =>
  page.title.includes("Ability:"),
);
for (const abilityPage of allAbilityPages) {
  const abilityName = abilityPage.title.split("Ability:")[1];

  pct += 1 / allAbilityPages.length;
  progress.update({ pct: pct, message: `Pulling ${abilityName} from wiki.` });

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
    abilityItem = await game.teriock.api.utils.fromUuid(abilityItem.uuid);
  }
  let abilityEffect = abilityItem.effectTypes.ability.find(
    (a) => a.name === abilityName,
  );
  console.log(abilityEffect);

  if (!abilityEffect) {
    abilityEffect = await game.teriock.api.create.createAbility(
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
}
