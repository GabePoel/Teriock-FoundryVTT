const essentialsPack = game.teriock.packs.essentials();
const essentialsFolders = essentialsPack.folders;

const rawPropertiesFolderName = "Raw Properties";
let rawPropertiesFolder = essentialsFolders.getName(rawPropertiesFolderName);
if (!rawPropertiesFolder) {
  await Folder.create(
    {
      name: rawPropertiesFolderName,
      type: "Item",
    },
    {
      pack: "teriock.essentials",
    },
  );
}

/** @type {object} */
const progress = ui.notifications.info(`Pulling all properties from wiki.`, {
  progress: true,
});
let pct = 0;

let allPropertyPages =
  await game.teriock.api.wiki.fetchCategoryMembers("Properties");
allPropertyPages = allPropertyPages.filter((page) =>
  page.title.includes("Property:"),
);
for (const propertyPage of allPropertyPages) {
  const propertyName = propertyPage.title.split("Property:")[1];

  pct += 1 / allPropertyPages.length;
  progress.update({ pct: pct, message: `Pulling ${propertyName} from wiki.` });

  let propertyItem = essentialsPack.index.find((e) => e.name === propertyName);
  if (!propertyItem) {
    propertyItem = await game.teriock.Item.create(
      {
        name: propertyName,
        type: "equipment",
        system: {
          type: "other",
          description: `This equipment is a wrapper for ${propertyName}.`,
        },
        folder: rawPropertiesFolder.id,
      },
      { pack: "teriock.essentials" },
    );
  } else {
    propertyItem = await foundry.utils.fromUuid(propertyItem.uuid);
  }
  await propertyItem.setFlag("teriock", "propertyWrapper", true);
  await propertyItem.setFlag("teriock", "effectWrapper", true);
  let propertyEffect = propertyItem.properties.find(
    (a) => a.name === propertyName,
  );
  console.log(propertyEffect);

  if (!propertyEffect) {
    propertyEffect = await game.teriock.api.create.property(
      propertyItem,
      propertyName,
      { notify: false },
    );
  } else {
    await propertyEffect.system.wikiPull({ notify: false });
  }
  if (propertyItem.img !== propertyEffect.img) {
    await propertyItem.update({ img: propertyEffect.img });
  }
}