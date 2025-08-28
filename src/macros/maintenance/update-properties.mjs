const propertiesPack = game.teriock.packs.properties();

const progress = ui.notifications.info(`Pulling all properties from wiki.`, {
  progress: true,
});

let allPropertyPages =
  await game.teriock.api.wiki.fetchCategoryMembers("Properties");
allPropertyPages = allPropertyPages.filter((page) =>
  page.title.includes("Property:"),
);

async function processProperty(propertyPage, _index, _total) {
  const propertyName = propertyPage.title.split("Property:")[1];

  let propertyItem = propertiesPack.index.find((e) => e.name === propertyName);
  if (!propertyItem) {
    propertyItem = await game.teriock.Item.create(
      {
        name: propertyName,
        type: "wrapper",
      },
      { pack: "teriock.properties" },
    );
  } else {
    propertyItem = await foundry.utils.fromUuid(propertyItem.uuid);
  }
  let propertyEffect = propertyItem.properties.find(
    (a) => a.name === propertyName,
  );

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

  return { propertyName: propertyName, success: true };
}

const BATCH_SIZE = 50;
const total = allPropertyPages.length;
const results = [];

progress.update({
  pct: 0.1,
  message: `Processing ${total} properties in batches of ${BATCH_SIZE}...`,
});

try {
  for (let start = 0; start < total; start += BATCH_SIZE) {
    const batch = allPropertyPages.slice(start, start + BATCH_SIZE);

    const batchPromises = batch.map((propertyPage, i) =>
      processProperty(propertyPage, start + i, total),
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    const processed = Math.min(start + batch.length, total);
    const pct = 0.1 + 0.9 * (processed / total);

    progress.update({
      pct: Math.min(pct, 1),
      message: `Processed ${processed}/${total} properties (batch ${Math.floor(start / BATCH_SIZE) + 1}/${Math.ceil(total / BATCH_SIZE)}).`,
    });
  }

  progress.update({
    pct: 1,
    message: `Successfully processed ${results.length} properties.`,
  });

  console.log(
    `Completed processing ${results.length} properties:`,
    results.map((r) => r.propertyName),
  );
} catch (error) {
  progress.update({
    pct: 1,
    message: `Error occurred during processing: ${error.message}`,
  });
  console.error("Error processing properties:", error);
}
