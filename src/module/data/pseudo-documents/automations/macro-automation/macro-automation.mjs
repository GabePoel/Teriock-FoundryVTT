import { mixClasses } from "../../../../helpers/construction.mjs";
import { resolveDocument } from "../../../../helpers/resolve.mjs";
import { MacroActivation } from "../../activations/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { DisplayAutomationMixin, TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 */
export default class MacroAutomation
  extends mixClasses(BaseAutomation, TriggerAutomationMixin, DisplayAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Macro"];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { tags: { interactInExecution: true }, type: "macro" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      primaryMacro: new fields.DocumentUUIDField({ type: "Macro" }),
      secondaryMacro: new fields.DocumentUUIDField({ type: "Macro" }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...this._macroPaths, "hr", ...this._triggerDisplayPaths];
  }

  /**
   * Paths for the macros this can execute. A macro that runs inline has no activation to put a secondary
   * macro on.
   * @returns {string[]}
   */
  get _macroPaths() {
    return this.interactInExecution ? ["primaryMacro"] : ["primaryMacro", "secondaryMacro"];
  }

  /**
   * A macro that runs inline during the execution leaves no button behind.
   * @inheritDoc
   */
  get canGetActivations() {
    return !this.interactInExecution && super.canGetActivations;
  }

  /**
   * Convenience helper to check if this has a macro.
   * @returns {boolean}
   */
  get hasMacro() {
    return this.primaryMacro && Boolean(fromUuidSync(this.primaryMacro));
  }

  /** @inheritDoc */
  async _getActivations() {
    const macro = await resolveDocument(this.primaryMacro);
    return [
      new MacroActivation({
        display: { label: this.display.label || macro?.name || this.label },
        primaryMacro: this.primaryMacro,
        secondaryMacro: this.secondaryMacro,
      }),
    ];
  }

  /** @inheritDoc */
  canFire(trigger, scope) {
    return super.canFire(trigger, scope) && this.hasMacro;
  }

  /**
   * Execute the primary macro.
   * @param {Teriock.System.TriggerScope} scope
   * @return {Promise<void>}
   */
  async executeMacro(scope = {}) {
    if (!this.hasMacro) { return; }
    const macro = await fromUuid(this.primaryMacro);
    await macro.execute(this.getScope(scope));
  }

  /** @inheritDoc */
  async interactOnExecutionInput(execution) {
    if (this.interactInExecution) { await this.executeMacro(execution.getScope()); }
  }
}
