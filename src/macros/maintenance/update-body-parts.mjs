const bodyPack = game.teriock.packs.bodyParts;

ui.notifications.info("Pulling all body parts from wiki.");

async function processBody(bodyName) {
  let bodyItem = bodyPack.index.find((e) => e.name === bodyName);
  if (!bodyItem) {
    bodyItem = await game.teriock.Item.create(
      {
        name: bodyName,
        type: "body",
      },
      { pack: "teriock.bodyParts" },
    );
  } else {
    bodyItem = await fromUuid(bodyItem.uuid);
  }
  await bodyItem.system.wikiPull({ notify: false });
  await bodyItem.update({ "system.description": "" });
}

const bodyPromises = Object.values(TERIOCK.index.bodyParts).map((bodyName) =>
  processBody(bodyName),
);

await Promise.all(bodyPromises);
ui.notifications.success("Done.");
