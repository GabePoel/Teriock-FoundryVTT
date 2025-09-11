/** @type {Record<string,TeriockMacro>} */
const toRun = {
  updateAbilities: await fromUuid("Compendium.teriock.maintenance.Macro.tdghrSTQaqPfwEQZ"),
  updateBasicAbilities: await fromUuid("Compendium.teriock.maintenance.Macro.AEHBs2Fh23ulcqyb"),
  updateClasses: await fromUuid("Compendium.teriock.maintenance.Macro.XZc2aJXX8vYFmW64"),
  updateFamilies: await fromUuid("Compendium.teriock.maintenance.Macro.5LY0aaXJj1QY11Bf"),
  updateProperties: await fromUuid("Compendium.teriock.maintenance.Macro.lM9iJK0o7R8cVvL9"),
  updateSpecies: await fromUuid("Compendium.teriock.maintenance.Macro.U0WfGPoPSLSystNU"), // Equipment is last because
                                                                                          // it's the buggiest
  updateEquipment: await fromUuid("Compendium.teriock.maintenance.Macro.NccvZMMNyFS0braS"),
};
for (const macro of Object.values(toRun)) {
  await macro.execute();
}
