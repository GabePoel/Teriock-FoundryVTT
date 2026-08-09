import { mixClasses } from "../../../../helpers/construction.mjs";
import { resolveDocument } from "../../../../helpers/resolve.mjs";
import { lcFirst } from "../../../../helpers/string.mjs";
import { migrateKey, migrateValue } from "../../../migrations/source-migrations.mjs";
import MacroActivation from "../../activations/macro-activation.mjs";
import DisplayAutomationMixin from "./display-automation-mixin.mjs";
import TriggerAutomationMixin from "./trigger-automation-mixin.mjs";

const { fields } = foundry.data;

/**
 * @template {Constructor<BaseAutomation>} T
 * @param {T} Base
 */
export default function MacroAutomationMixin(Base) {
  /**
   * @extends {BaseAutomation}
   * @mixes TriggerAutomation
   * @mixes DisplayAutomation
   * @mixin
   * @property {UUID<TeriockMacro>} primaryMacro
   * @property {UUID<TeriockMacro>} secondaryMacro
   */
  class MacroAutomation extends mixClasses(Base, TriggerAutomationMixin, DisplayAutomationMixin) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Macro"];

    /** @inheritDoc */
    static get LABEL() {
      return "TERIOCK.AUTOMATIONS.Macro.LABEL";
    }

    /** @inheritDoc */
    static get metadata() {
      return Object.assign(super.metadata, { macro: true });
    }

    /**
     * Macros run via {@link executeMacro} on execute, not the default activation path.
     * @inheritDoc
     */
    static get triggerMetadata() {
      return Object.assign(super.triggerMetadata, { activationTime: null, executionTriggers: true });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        primaryMacro: new fields.DocumentUUIDField({ type: "Macro" }),
        secondaryMacro: new fields.DocumentUUIDField({ type: "Macro" }),
      });
    }

    /** @inheritDoc */
    static migrateData(source, options, state) {
      migrateKey(source, "macro", "primaryMacro");
      migrateKey(source, "pseudoHook", "trigger");
      migrateValue(source, "relation", "pseudoHook", "trigger");
      migrateValue(source, "trigger", "effectApplication", "applyEffect");
      migrateValue(source, "trigger", "effectExpiration", "expireEffect");
      if (source.trigger?.includes("equipment")) {
        source.trigger = source.trigger.replace("equipment", "");
        source.trigger = lcFirst(source.trigger);
      }
      return super.migrateData(source, options, state);
    }

    /** @inheritDoc */
    get _formPaths() {
      return [...this._macroPaths, "hr", ...this._triggerDisplayPaths];
    }

    /** @inheritDoc */
    get _hasButtons() {
      return super._hasButtons && this.hasMacro;
    }

    /**
     * Paths for the macros this can execute.
     * @returns {string[]}
     */
    get _macroPaths() {
      return this.makesActivation ? ["primaryMacro", "secondaryMacro"] : ["primaryMacro"];
    }

    /**
     * Convenience helper to check if this has a macro.
     * @returns {boolean}
     */
    get hasMacro() {
      return this.primaryMacro && Boolean(fromUuidSync(this.primaryMacro));
    }

    /**
     * Whether this generates an activation for something to press.
     * @returns {boolean}
     */
    get makesActivation() {
      return !this._isActiveTrigger(this.trigger);
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
    async _preFireExecutionTrigger(scope) {
      await this.executeMacro(scope);
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
  }

  return MacroAutomation;
}
