import { mix } from "../../../helpers/construction.mjs";
import { commands } from "../../../helpers/interaction/_module.mjs";
import { listFormat } from "../../../helpers/localization.mjs";
import * as activations from "../activations/command-activations.mjs";
import BaseAutomation from "./abstract/base-automation.mjs";
import {
  ConfirmationDialogAutomationMixin,
  TriggerAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Set<Teriock.Keys.CommonOutcome>} common
 * @mixes ConfirmationDialogAutomation
 * @mixes TriggerAutomation
 */
export default class CommonOutcomesAutomation extends mix(
  BaseAutomation,
  ConfirmationDialogAutomationMixin,
  TriggerAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.CommonOutcomes",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.CommonOutcomes.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "common";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      common: new fields.SetField(
        new fields.StringField({
          choices: TERIOCK.config.consequence.common,
        }),
      ),
    });
  }

  /** @inheritDoc */
  get _confirmationPaths() {
    return this.trigger ? super._confirmationPaths : [];
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["common", ...this._confirmationPaths, ...super._formPaths];
  }

  /** @inheritDoc */
  get _showConfirmationWarning() {
    return !!this.trigger && super._showConfirmationWarning;
  }

  /**
   * Apply common outcomes.
   * @param {Teriock.System.TriggerScope} scope
   * @returns {Promise<void>}
   */
  async #applyCommonOutcomes(scope = {}) {
    const actor = scope?.actor ?? this.document.actor;
    if (!actor) return;
    const outcomes = listFormat(
      this.common.map((c) => TERIOCK.config.consequence.common[c]),
    );
    const shouldApply = await this.getConfirmation({
      content: "TERIOCK.AUTOMATIONS.CommonOutcomes.DIALOG.content",
      data: { outcomes },
    });
    if (!shouldApply) return;
    for (const c of this.common) await commands[c].primary(actor);
  }

  /** @inheritDoc */
  async _getActivations(options) {
    const activationOptions = {};
    if (
      foundry.utils.hasProperty(options, "execution.armament.uuid") &&
      foundry.utils.hasProperty(options, "execution.actor.uuid")
    ) {
      const uuid = foundry.utils.buildRelativeUuid(
        options.execution.armament,
        options.execution.actor,
      );
      foundry.utils.setProperty(activationOptions, "options.armament", uuid);
    }
    return Array.from(this.common)
      .filter(Boolean)
      .map((c) => {
        const Act = Object.values(activations).find((A) => A.TYPE === c);
        if (Act) return new Act(foundry.utils.deepClone(activationOptions));
      })
      .filter(Boolean);
  }

  /** @inheritDoc */
  _onFire(scope) {
    this.#applyCommonOutcomes(scope);
  }
}
