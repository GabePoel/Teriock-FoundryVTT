import { TeriockMacro } from "../../documents/_module.mjs";
import { findBestDocument, makeIcon } from "../../helpers/utils.mjs";
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
    if (!macroId) { return null; }
    return game.macros.get(macroId) ?? null;
  }

  /**
   * @inheritDoc
   * @param {AnyChildDocument} doc
   */
  async _createDocumentSheetToggle(doc) {
    if (doc.documentMetadata.child) {
      const macroType = await hotbarDropDialog(doc);
      if (macroType === "linked") { return TeriockMacro.getLinkedUseMacro(doc); }
      else if (macroType === "general") { return TeriockMacro.getGeneralUseMacro(doc); }
    } else {
      return super._createDocumentSheetToggle(doc);
    }
  }

  /** @inheritDoc */
  _getContextMenuOptions() {
    const options = super._getContextMenuOptions();
    options.push({
      icon: makeIcon(TERIOCK.display.icons.ui.openWindow, "contextMenu"),
      label: _loc("TERIOCK.DIALOGS.HotbarDrop.entry"),
      onClick: async (ev, li) => {
        const macro = this.#getMacroForSlot(li);
        if (macro.getFlag("teriock", "macroType") === "useGeneral") {
          const actor = game.actors.default;
          const doc = await findBestDocument(macro.getFlag("teriock", "macroLookupKey"), actor, {
            relativeOnly: false,
          });
          await doc?.sheet.render(true);
        } else {
          const uuid = macro.getFlag("teriock", "macroDocumentUuid");
          const doc = await fromUuid(uuid);
          await doc?.sheet.render(true);
        }
      },
      visible: li => {
        const macro = this.#getMacroForSlot(li);
        return ["useGeneral", "useLinked"].includes(macro.getFlag("teriock", "macroType"));
      },
    });
    return options;
  }
}
