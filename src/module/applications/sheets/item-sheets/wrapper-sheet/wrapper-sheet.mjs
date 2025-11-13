import { toTitleCase } from "../../../../helpers/string.mjs";
import { selectDialog } from "../../../dialogs/select-dialog.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockWrapper}.
 */
export default class TeriockWrapperSheet extends TeriockBaseItemSheet {
  /** @inheritDoc */
  async _preRender(context, options) {
    //noinspection JSAccessibilityCheck
    await super._preRender(context, options);
    if (this.document.effects.size === 0) {
      const typeChoices = {};
      for (const type of this.document.metadata.childEffectTypes) {
        typeChoices[type] = toTitleCase(type);
      }
      const type = await selectDialog(typeChoices, {
        label: "Select Effect Type",
        hint: "What type of effect is this a wrapper for?",
      });
      await this.document.createEmbeddedDocuments("ActiveEffect", [
        {
          name: this.document.name,
          type: type,
        },
      ]);
      await this.document.update({ img: this.document.system.effect.img });
    }
  }

  /** @inheritDoc */
  async render(options) {
    await super.render(options);
    const out = await this.document.system.effect.sheet.render({ force: true });
    await this.close({ animate: false });
    return out;
  }
}
