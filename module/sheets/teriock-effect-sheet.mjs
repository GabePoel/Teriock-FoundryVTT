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
        const application = entry.dataset.application;
        const updateString = `system.applies.${application}.changes`;
        let value = entry.value;
        if (!isNaN(value) && value !== '') {
          const intValue = parseInt(value, 10);
          if (!isNaN(intValue) && intValue.toString() === value.trim()) {
            value = intValue;
          }
        }
        if (typeof value === "string" && value.trim() !== "" && !isNaN(value)) {
          value = Number(value);
        }
        const changes = this.document.system.applies[application].changes;
        console.log(`Updating change at index ${index} for application ${application}`, changes);
        if (index >= 0 && index < changes.length) {
          changes[index][key] = value;
          this.document.update({ [updateString]: changes });
        }
      });
    });
  }

  static async _addChange(event, target) {
    event.preventDefault();
    const application = target.dataset.application;
    const updateString = `system.applies.${application}.changes`;
    const changes = this.document.system.applies[application].changes;
    const newChange = {
      key: '',
      mode: 0,
      value: '',
      priority: 0,
    };
    changes.push(newChange);
    await this.document.update({ [updateString]: changes });
  }

  static async _deleteChange(event, target) {
    event.preventDefault();
    const index = parseInt(target.dataset.index, 10);
    const application = target.dataset.application;
    const updateString = `system.applies.${application}.changes`;
    console.log(updateString);
    const changes = this.document.system.applies[application].changes;
    console.log(`Deleting change at index ${index} from changes`, changes);
    if (index >= 0 && index < changes.length) {
      changes.splice(index, 1);
      await this.document.update({ [updateString]: changes });
    }
  }
}