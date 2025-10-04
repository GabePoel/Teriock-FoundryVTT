/** @type {Record<string,TeriockMacro>} */
const toRun = {
  abilities: await fromUuid(
    "Compendium.teriock.maintenance.Macro.tdghrSTQaqPfwEQZ",
  ),
  "basic abilities": await fromUuid(
    "Compendium.teriock.maintenance.Macro.AEHBs2Fh23ulcqyb",
  ),
  classes: await fromUuid(
    "Compendium.teriock.maintenance.Macro.XZc2aJXX8vYFmW64",
  ),
  familiars: await fromUuid(
    "Compendium.teriock.maintenance.Macro.5LY0aaXJj1QY11Bf",
  ),
  properties: await fromUuid(
    "Compendium.teriock.maintenance.Macro.lM9iJK0o7R8cVvL9",
  ),
  species: await fromUuid(
    "Compendium.teriock.maintenance.Macro.U0WfGPoPSLSystNU",
  ),
  creatures: await fromUuid(
    "Compendium.teriock.maintenance.Macro.qhpeHJ0ZJGDfUOPo",
  ),
  equipment: await fromUuid(
    "Compendium.teriock.maintenance.Macro.NccvZMMNyFS0braS",
  ),
  "magic items": await fromUuid(
    "Compendium.teriock.maintenance.Macro.PW6nyzkzO59fogTh",
  ),
};

const macroEntries = Object.entries(toRun);
const totalMacros = macroEntries.length;

const progress = foundry.ui.notifications.info(
  "Running maintenance macros...",
  {
    progress: true,
    pct: 0.01,
  },
);

let completedCount = 0;

for (const [macroName, macro] of macroEntries) {
  progress.update({
    pct: completedCount / totalMacros,
    message: `Updating ${macroName}... (${completedCount + 1}/${totalMacros})`,
  });

  await macro.execute();

  completedCount++;
}

progress.update({
  pct: 1,
  message: "All maintenance macros completed.",
});

foundry.ui.notifications.success(
  `Successfully executed ${totalMacros} maintenance macros.`,
);
