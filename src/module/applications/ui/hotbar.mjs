import { hotbarDropDialog } from "../dialogs/_module.mjs";
import { TeriockMacro } from "../../documents/_module.mjs";
import { TeriockFolder } from "../../documents/_module.mjs";

const { Hotbar } = foundry.applications.ui;

export default class TeriockHotbar extends Hotbar {
  /**
   * @inheritDoc
   * @param {TeriockItem|TeriockEffect} doc
   */
  async _createDocumentSheetToggle(doc) {
    if (["Item", "ActiveEffect"].includes(doc.documentName)) {
      const macroType = await hotbarDropDialog(doc);
      let searchTerm;
      let command;
      const macroName = `Use ${doc.name}`;
      if (macroType === "general") {
        searchTerm = `// ABILITY: ${doc.name}`;
        command = `
          // ABILITY: ${doc.name}
          const tokens = game.canvas.tokens.controlled;
          const actors = tokens.map(t => t.actor);
          const options = {
            advantage: event?.altKey,
            disadvantage: event?.shiftKey,
            twoHanded: event?.ctrlKey,
          }
          for (const actor of actors) {
            await actor.useAbility("${doc.name}", options);
          }`;
      } else {
        searchTerm = `// UUID: ${doc.uuid}`;
        command = `
          // UUID: ${doc.uuid}
          const item = await fromUuid("${doc.uuid}");
          if (!item) return ui.notifications.warn("Document not found: ${doc.name}");
          const options = {
            advantage: event?.altKey,
            disadvantage: event?.shiftKey,
            twoHanded: event?.ctrlKey,
          };
          await item.use(options);`;
      }
      command = game.teriock.api.utils.dedent(command);
      const folders =
        /** @type {Collection<string, TeriockFolder>} */ game.folders;
      let macroFolder = folders.find(
        (f) => f.name === "Player Macros" && f.type === "Macro",
      );
      if (!macroFolder) {
        macroFolder = await TeriockFolder.create({
          name: "Player Macros",
          type: "Macro",
        });
      }
      const macros =
        /** @type {Collection<string, TeriockMacro>} */ game.macros;
      let macro = macros.find(
        (m) => m.name === macroName && m.command.startsWith(searchTerm),
      );
      if (!macro) {
        macro = TeriockMacro.create({
          name: macroName,
          type: "script",
          img: doc.img,
          command: command,
          flags: { teriock: { itemMacro: true } },
          folder: macroFolder.id,
        });
      }
      return macro;
    } else {
      return await super._createDocumentSheetToggle(doc);
    }
  }
}
