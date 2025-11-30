const abilitiesPack = game.teriock.packs.abilities;

const progress = ui.notifications.info(`Pulling all abilities from wiki.`, {
  progress: true,
});

async function processAbility(abilityName, _index, _total) {
  let abilityItem = abilitiesPack.index.find((e) => e.name === abilityName);
  if (!abilityItem) {
    abilityItem = await game.teriock.Item.create(
      {
        name: abilityName,
        type: "wrapper",
      },
      { pack: "teriock.abilities" },
    );
  } else {
    abilityItem = await fromUuid(abilityItem.uuid);
  }
  let abilityEffect = abilityItem.abilities.find((a) => a.name === abilityName);

  if (!abilityEffect) {
    const abilityData = {
      name: abilityName,
      type: "ability",
    };
    abilityEffect = await abilityItem.createChildDocuments("ActiveEffect", [
      abilityData,
    ]);
  }
  await abilityEffect.system.wikiPull({ notify: false });

  if (abilityItem.img !== abilityEffect.img) {
    await abilityItem.update({ img: abilityEffect.img });
  }

  return {
    abilityName,
    success: true,
  };
}

const BATCH_SIZE = 50;
const total = Object.values(TERIOCK.index.abilities).length;
const results = [];

progress.update({
  pct: 0.1,
  message: `Processing ${total} abilities in batches of ${BATCH_SIZE}...`,
});

try {
  for (let start = 0; start < total; start += BATCH_SIZE) {
    const batch = Object.values(TERIOCK.index.abilities).slice(
      start,
      start + BATCH_SIZE,
    );

    const batchPromises = batch.map((abilityName, i) =>
      processAbility(abilityName, start + i, total),
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    const processed = Math.min(start + batch.length, total);
    const pct = 0.1 + 0.9 * (processed / total);

    progress.update({
      pct: Math.min(pct, 1),
      message: `Processed ${processed}/${total} abilities (batch ${Math.floor(start / BATCH_SIZE) + 1}/${Math.ceil(
        total / BATCH_SIZE,
      )}).`,
    });
  }

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
