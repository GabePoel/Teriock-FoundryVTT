const { api, sheets } = foundry.applications;
import { TeriockSheet } from "../mixins/sheet-mixin.mjs";
import { documentOptions } from "../helpers/constants/document-options.mjs";

export class TeriockEffectSheet extends TeriockSheet(sheets.ActiveEffectConfig) {
  static DEFAULT_OPTIONS = {
    classes: ['effect'],
    window: {
      icon: `fa-solid fa-${documentOptions.effect.icon}`,
    },
  };

  /** @override */
  async _prepareContext() {
    const context = {
      config: CONFIG.TERIOCK,
      editable: this.isEditable && this.document.system.editable,
      document: this.document,
      limited: this.document.limited,
      owner: this.document.isOwner,
      system: this.document.system,
      name: this.document.name,
      img: this.document.img,
      flags: this.document.flags,
      disabled: this.document.disabled,
    };
    const system = this.document.system;
    context.enrichedDescription = await this._editor(system.description);
    return context;
  }
}