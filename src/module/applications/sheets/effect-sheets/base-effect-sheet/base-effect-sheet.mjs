import { documentOptions } from "../../../../constants/options/document-options.mjs";
import * as createEffects from "../../../../helpers/create-effects.mjs";
import { selectAbilityDialog } from "../../../dialogs/select-dialog.mjs";
import {
  ChatButtonSheetMixin,
  CommonSheetMixin,
} from "../../mixins/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * Base effect sheet for Teriock system active effects.
 * Provides common functionality for all effect sheets including change management,
 * context preparation, and effect state handling.
 * @extends ActiveEffectConfig
 * @mixes ChatButtonSheet
 * @mixes CommonSheet
 * @property {TeriockEffect} document
 */
export default class TeriockBaseEffectSheet extends ChatButtonSheetMixin(
  CommonSheetMixin(ActiveEffectConfig),
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["effect"],
    window: {
      icon: `fa-solid fa-${documentOptions.effect.icon}`,
    },
    actions: {
      addChange: this._addChange,
      createAbility: this._createAbility,
      deleteChange: this._deleteChange,
      toggleDisabledThis: this._toggledDisabledThis,
    },
  };

  /**
   * Adds a new change at any specified path.
   * @param {Event} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when change is added.
   * @static
   */
  static async _addChange(_event, target) {
    const path = target.dataset.path;
    if (!path) {
      console.error("No path specified for addChange action");
      return;
    }
    const currentChanges = foundry.utils.getProperty(this.document, path) || [];
    const newChange = {
      key: "",
      mode: 0,
      value: "",
      priority: 0,
    };
    currentChanges.push(newChange);
    await this.document.update({ [path]: currentChanges });
  }

  /**
   * Adds a new change to an effect.
   * @param {Event} _event - The event object.
   * @param {HTMLElement} _target - The target element.
   * @returns {Promise<void>} Promise that resolves when change is added.
   * @static
   */
  static async _addRootChange(_event, _target) {
    const changes = this.document.changes;
    const newChange = {
      key: "",
      mode: 0,
      value: "",
      priority: 0,
    };
    changes.push(newChange);
    await this.document.update({ changes: changes });
  }

  /** @inheritDoc */
  static async _createAbility(_event, _target) {
    const abilityKey = await selectAbilityDialog();
    let abilityName = "New Ability";
    if (abilityKey && abilityKey !== "other") {
      abilityName = TERIOCK.index.abilities[abilityKey];
      const ability = await tm.fetch.importAbility(
        this.document.parent,
        abilityName,
      );
      await this.document.addSub(ability);
    } else {
      await createEffects.createAbility(this.document, abilityName);
    }
  }

  /**
   * Deletes a change at any specified path.
   * @param {Event} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when change is deleted.
   * @static
   */
  static async _deleteChange(_event, target) {
    const index = parseInt(target.dataset.index, 10);
    const path = target.dataset.path;
    if (!path) {
      console.error("No path specified for deleteChange action");
      return;
    }
    const changes = foundry.utils.getProperty(this.document, path);
    if (!changes || !Array.isArray(changes)) {
      console.error(`No changes array found at path: ${path}`);
      return;
    }
    if (index >= 0 && index < changes.length) {
      changes.splice(index, 1);
      await this.document.update({ [path]: changes });
    }
  }

  /**
   * Toggles the disabled state of the current effect.
   * @returns {Promise<void>} Promise that resolves when disabled state is toggled.
   * @static
   */
  static async _toggledDisabledThis() {
    await this.document.update({ disabled: !this.document.disabled });
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    Object.assign(context, {
      disabled: this.document.disabled,
      transfer: this.document.transfer,
      isSuppressed: this.document.isSuppressed,
      isProficient: this.document.isProficient,
      isFluent: this.document.isFluent,
      modes: {
        0: "Custom",
        1: "Multiply",
        2: "Add",
        3: "Downgrade",
        4: "Upgrade",
        5: "Override",
      },
    });
    await this._enrichAll(context, {
      description: this.document.system.description,
    });
    return context;
  }
}
