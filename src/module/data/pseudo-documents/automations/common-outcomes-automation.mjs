import { mixClasses } from "../../../helpers/construction.mjs";
import { listFormat } from "../../../helpers/localization.mjs";
import * as activations from "../activations/command-activations.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import { ConfirmationDialogAutomationMixin, TriggerAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Set<Teriock.Keys.CommonOutcome>} common
 * @extends {CritAutomation}
 * @mixes ConfirmationDialogAutomation
 * @mixes TriggerAutomation
 */
export default class CommonOutcomesAutomation
  extends mixClasses(CritAutomation, ConfirmationDialogAutomationMixin, TriggerAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.CommonOutcomes"];

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
      common: new fields.SetField(new fields.StringField({ choices: TERIOCK.config.consequence.common })),
    });
  }

  /**
   * Apply common outcomes.
   * @param {Teriock.System.TriggerScope} scope
   * @returns {Promise<void>}
   */
  async #applyCommonOutcomes(scope = {}) {
    const actor = scope?.actor ?? this.document.actor;
    if (!actor) { return; }
    const outcomes = listFormat(this.common.map(c => TERIOCK.config.consequence.common[c]));
    const shouldApply = await this.getConfirmation({
      content: "TERIOCK.AUTOMATIONS.CommonOutcomes.DIALOG.content",
      data: { outcomes },
    });
    if (!shouldApply) { return; }
    await this._activateActivations(scope);
  }

  /** @inheritDoc */
  get _confirmationPaths() {
    return this.trigger ? super._confirmationPaths : [];
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["common", ...super._formPaths, ...this._confirmationPaths];
  }

  /** @inheritDoc */
  get _showConfirmationWarning() {
    return !!this.trigger && super._showConfirmationWarning;
  }

  /** @inheritDoc */
  async _getActivations(options) {
    const activationOptions = {};
    if (
      foundry.utils.hasProperty(options, "execution.armament.uuid")
      && foundry.utils.hasProperty(options, "execution.actor.uuid")
    ) {
      const uuid = foundry.utils.buildRelativeUuid(options.execution.armament, options.execution.actor);
      foundry.utils.setProperty(activationOptions, "options.armament", uuid);
    }
    return Array.from(this.common).filter(Boolean).map(c => {
      const Act = Object.values(activations).find(A => A.TYPE === c);
      if (Act) { return new Act(foundry.utils.deepClone(activationOptions)); }
    }).filter(Boolean);
  }

  /** @inheritDoc */
  _onFire(scope) {
    this.#applyCommonOutcomes(scope);
  }
}
