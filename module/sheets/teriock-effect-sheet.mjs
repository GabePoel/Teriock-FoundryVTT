const { sheets } = foundry.applications;
import { documentOptions } from "../helpers/constants/document-options.mjs";
import { TeriockSheet } from "./sheet-mixin.mjs";

export class TeriockEffectSheet extends TeriockSheet(sheets.ActiveEffectConfig) {
  static DEFAULT_OPTIONS = {
    classes: ['effect'],
    window: {
      icon: `fa-solid fa-${documentOptions.effect.icon}`,
    },
    actions: {
      addChange: this._addChange,
      deleteChange: this._deleteChange,
    },
  };

  /** @override */
  async _prepareContext() {
    const context = {
      config: CONFIG.TERIOCK,
      editable: this.isEditable && !this._locked,
      document: this.document,
      limited: this.document.limited,
      owner: this.document.isOwner,
      system: this.document.system,
      name: this.document.name,
      img: this.document.img,
      flags: this.document.flags,
      disabled: this.document.disabled,
      changes: this.document.changes,
    };
    const system = this.document.system;
    context.enrichedDescription = await this._editor(system.description);
    return context;
  }

  /** @override */
  _onRender(context, options) {
    super._onRender(context, options);
    this.element.querySelectorAll('.change-box-entry').forEach((entry) => {
      entry.addEventListener('change', (event) => {
        const index = parseInt(entry.dataset.index, 10);
        const key = entry.dataset.key;
        const value = entry.value;
        const changes = this.document.changes;
        if (index >= 0 && index < changes.length) {
          changes[index][key] = value;
          this.document.update({ changes });
        }
      });
    });
  }

  static async _addChange(event) {
    event.preventDefault();
    const changes = this.document.changes;
    const newChange = {
      key: '',
      mode: 0,
      value: '',
      priority: 0,
    };
    changes.push(newChange);
    await this.document.update({ changes });
  }

  static async _deleteChange(event, target) {
    event.preventDefault();
    const index = parseInt(target.dataset.index, 10);
    const changes = this.document.changes;
    console.log(`Deleting change at index ${index} from changes`, changes);
    if (index >= 0 && index < changes.length) {
      changes.splice(index, 1);
      console.log(`Updated changes after deletion`, changes);
      await this.document.update({ changes });
    }
  }
}