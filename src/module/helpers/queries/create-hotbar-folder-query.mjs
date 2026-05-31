import { TeriockFolder } from "../../documents/_module.mjs";

/**
 * Query that asks the GM {@link TeriockUser} to create a macro folder for another player. This is used so that the
 * macros they drop in the hotbar have a place to go.
 * @param {Teriock.Queries.CreateHotbarFolderData} queryData
 * @returns {Promise<void>}
 */
export default async function createHotbarFolderQuery(queryData) {
  const name = queryData.name;
  const id = queryData.id;
  let macroFolder = game.folders.find(f =>
    f.name === game.teriock.getSetting("playerMacrosFolderName") && f.type === "Macro"
  );
  if (!macroFolder) {
    macroFolder = await TeriockFolder.create({
      name: game.teriock.getSetting("playerMacrosFolderName"),
      type: "Macro",
    });
  }
  const macroSubFolder = game.folders.find(f =>
    f.getFlag("teriock", "user") === id && f.getFlag("teriock", "hotbarFolder") && f.type === "Macro"
  );
  const folderName = name.endsWith("s") ? `${name}' Macros` : `${name}'s Macros`;
  if (!macroSubFolder) {
    await TeriockFolder.create({
      flags: { teriock: { hotbarFolder: true, user: id } },
      folder: macroFolder,
      name: folderName,
      type: "Macro",
    });
  }
}
