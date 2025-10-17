import { TeriockMacro } from "../../documents/_module.mjs";
import { getActor, makeIcon } from "../../helpers/utils.mjs";

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
    //noinspection JSUnresolvedReference
    return game.macros.get(macroId) ?? null;
  }

  /**
   * @inheritDoc
   * @param {TeriockItem|TeriockEffect} doc
   */
  async _createDocumentSheetToggle(doc) {
    if (["Item", "ActiveEffect"].includes(doc.documentName)) {
      return TeriockMacro.getUseMacro(doc);
    } else {
      return await super._createDocumentSheetToggle(doc);
    }
  }

  /** @inheritDoc */
  _getContextMenuOptions() {
    const options = super._getContextMenuOptions();
    options.push({
      name: "Open Document Sheet",
      icon: makeIcon("arrow-up-right-from-square", "contextMenu"),
      condition: (li) => {
        const macro = this.#getMacroForSlot(li);
        return macro.getFlag("teriock", "macroType") === "use";
      },
      callback: async (li) => {
        const macro = this.#getMacroForSlot(li);
        const actor = getActor();
        const doc = await TeriockMacro.getDocument(
          actor,
          macro.getFlag("teriock", "macroDocumentName"),
          macro.getFlag("teriock", "macroDocumentType"),
        );
        //noinspection JSUnresolvedReference
        await doc?.sheet.render(true);
      },
    });
    return options;
  }
}
