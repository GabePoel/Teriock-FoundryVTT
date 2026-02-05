import { TeriockMacro } from "../../documents/_module.mjs";
import { makeIcon } from "../../helpers/utils.mjs";
import { hotbarDropDialog } from "../dialogs/_module.mjs";

const { Hotbar } = foundry.applications.ui;

export default class TeriockHotbar extends Hotbar {
  /**
   * A helper method used to retrieve a Macro document from a hotbar slot element.
   * @param {HTMLLIElement} element
   * @returns {TeriockMacro|null}
   */
  #getMacroForSlot(element) {
    const slot = element.dataset.slot;
    const macroId = game.user.hotbar[slot];
    if (!macroId) {
      return null;
    }
    return game.macros.get(macroId) ?? null;
  }

  /**
   * @inheritDoc
   * @param {TeriockChild} doc
   */
  async _createDocumentSheetToggle(doc) {
    if (doc.documentMetadata.child) {
      const macroType = await hotbarDropDialog(doc);
      if (macroType === "linked") {
        return TeriockMacro.getLinkedUseMacro(doc);
      } else if (macroType === "general") {
        return TeriockMacro.getGeneralUseMacro(doc);
      }
    } else {
      return super._createDocumentSheetToggle(doc);
    }
  }

  /** @inheritDoc */
  _getContextMenuOptions() {
    const options = super._getContextMenuOptions();
    options.push({
      name: "Open Document Sheet",
      icon: makeIcon(TERIOCK.display.icons.ui.openWindow, "contextMenu"),
      condition: (li) => {
        const macro = this.#getMacroForSlot(li);
        return ["useGeneral", "useLinked"].includes(
          macro.getFlag("teriock", "macroType"),
        );
      },
      callback: async (li) => {
        const macro = this.#getMacroForSlot(li);
        if (macro.getFlag("teriock", "macroType") === "useGeneral") {
          const actor = game.actors.defaultActor;
          const doc = await TeriockMacro.getDocument(
            actor,
            macro.getFlag("teriock", "macroDocumentName"),
            macro.getFlag("teriock", "macroDocumentType"),
          );
          await doc?.sheet.render(true);
        } else {
          const uuid = macro.getFlag("teriock", "macroDocumentUuid");
          const doc = await fromUuid(uuid);
          await doc?.sheet.render(true);
        }
      },
    });
    return options;
  }
}
