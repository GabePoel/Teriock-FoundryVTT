import { TeriockFolder } from "../../documents/_module.mjs";

/**
 * Query that asks the GM {@link TeriockUser} to create a macro folder for another player. This is used so that the
 * macros they drop in the hotbar have a place to go.
 * @param {Teriock.QueryData.CreateHotbarFolder} queryData
 * @param timeout
 * @returns {Promise<void>}
 */
export default async function createHotbarFolderQuery(queryData, { _timeout }) {
  const name = queryData.name;
  const folders = /** @type {Collection<string, TeriockFolder>} */ game.folders;
  let macroFolder = folders.find(
    (f) =>
      f.name === game.settings.get("teriock", "playerMacrosFolderName") &&
      f.type === "Macro",
  );
  if (!macroFolder) {
    macroFolder = await TeriockFolder.create({
      name: game.settings.get("teriock", "playerMacrosFolderName"),
      type: "Macro",
    });
  }
  let macroSubFolder = folders.find((f) => f.name === `${name}'s Macros`);
  if (!macroSubFolder) {
    await TeriockFolder.create({
      name: `${name}'s Macros`,
      type: "Macro",
      folder: macroFolder,
    });
  }
}
