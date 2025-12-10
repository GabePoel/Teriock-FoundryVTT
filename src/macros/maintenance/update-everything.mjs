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
  equipment: await fromUuid(
    "Compendium.teriock.maintenance.Macro.NccvZMMNyFS0braS",
  ),
  species: await fromUuid(
    "Compendium.teriock.maintenance.Macro.U0WfGPoPSLSystNU",
  ),
  creatures: await fromUuid(
    "Compendium.teriock.maintenance.Macro.qhpeHJ0ZJGDfUOPo",
  ),
  "magic items": await fromUuid(
    "Compendium.teriock.maintenance.Macro.PW6nyzkzO59fogTh",
  ),
  rules: await fromUuid(
    "Compendium.teriock.maintenance.Macro.BZNsJineLpkDJYYA",
  ),
};

await tm.utils.progressBar(
  Object.values(toRun),
  "Updating Compendiums",
  async (m) => {
    await m.execute();
  },
  { style: "warn" },
);
