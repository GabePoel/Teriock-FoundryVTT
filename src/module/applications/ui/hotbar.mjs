import { TeriockMacro } from "../../documents/_module.mjs";
import { dedent } from "../../helpers/utils.mjs";
import { hotbarDropDialog } from "../dialogs/_module.mjs";

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
      let macroName = `Use ${doc.name}`;
      if (macroType === "general") {
        searchTerm = `// USER: ${game.user.id} ABILITY: ${doc.name}`;
        command = `
          // USER: ${game.user.id} ABILITY: ${doc.name}
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
        if (doc.actor) {
          macroName = `Use ${doc.name} (${doc.actor.name})`;
        } else if (doc.parent) {
          macroName = `Use ${doc.name} (${doc.parent.name})`;
        }
        searchTerm = `// USER: ${game.user.id} UUID: ${doc.uuid}`;
        command = `
          // USER: ${game.user.id} UUID: ${doc.uuid}
          const item = await fromUuid("${doc.uuid}");
          if (!item) return ui.notifications.warn("Document not found: ${doc.name}");
          const options = {
            advantage: event?.altKey,
            disadvantage: event?.shiftKey,
            twoHanded: event?.ctrlKey,
          };
          await item.use(options);`;
      }
      command = dedent(command);
      const activeGm = /** @type {TeriockUser} */ game.users.activeGM;
      await activeGm.query("teriock.createHotbarFolder", {
        name: game.user.name,
      });
      const folders =
        /** @type {Collection<string, TeriockFolder>} */ game.folders;
      let macroSubFolder = folders.find(
        (f) => f.name === `${game.user.name}'s Macros`,
      );
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
          folder: macroSubFolder.id,
        });
      }
      return macro;
    } else {
      return await super._createDocumentSheetToggle(doc);
    }
  }
}
