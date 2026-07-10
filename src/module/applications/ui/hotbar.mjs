import { TeriockMacro } from "../../documents/_module.mjs";
import { makeIcon, makeIconClass } from "../../helpers/icon.mjs";
import { findBestDocument } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

const { Hotbar } = foundry.applications.ui;

/** @inheritDoc */
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
   * @param {AnyChildDocument} document
   */
  async _createDocumentSheetToggle(document) {
    if (document.documentMetadata.child) {
      const macroType = await TeriockDialog.prompt({
        buttons: [{
          action: "linked",
          icon: makeIconClass(TERIOCK.display.icons.ui.linked),
          label: _loc("TERIOCK.DIALOGS.HotbarDrop.BUTTONS.linked"),
          callback: () => "linked",
        }],
        content: await TeriockTextEditor.enrichHTML(
          await TeriockTextEditor.renderTemplate("teriock/dialogs/hotbar-drop", {
            actor: `@UUID[${document.actor?.uuid}]`,
            child: `@UUID[${document.uuid}]`,
            identifier: document.lookupKey,
            label: TERIOCK.config.document[document.type].label.toLowerCase(),
          }),
        ),
        modal: true,
        ok: { default: true, label: _loc("TERIOCK.DIALOGS.HotbarDrop.BUTTONS.general"), callback: () => "general" },
        window: {
          icon: makeIconClass(TERIOCK.display.icons.ui.confirm, "title"),
          title: _loc("TERIOCK.DIALOGS.HotbarDrop.title"),
        },
      });
      if (macroType === "linked") { return TeriockMacro.getLinkedUseMacro(document); }
      else if (macroType === "general") { return TeriockMacro.getGeneralUseMacro(document); }
    } else {
      return super._createDocumentSheetToggle(document);
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
