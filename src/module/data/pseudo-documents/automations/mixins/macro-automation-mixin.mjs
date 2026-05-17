import { mixClasses } from "../../../../helpers/construction.mjs";
import { resolveDocument } from "../../../../helpers/resolve.mjs";
import { lcFirst } from "../../../../helpers/string.mjs";
import { migrateKey, migrateValue } from "../../../shared/migrations/source-migrations.mjs";
import { MacroActivation } from "../../activations/_module.mjs";
import DisplayAutomationMixin from "./display-automation-mixin.mjs";
import TriggerAutomationMixin from "./trigger-automation-mixin.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseAutomation} Base
 * @constructor
 */
export default function MacroAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @mixes TriggerAutomation
     * @mixes DisplayAutomation
     * @mixin
     * @property {UUID<TeriockMacro>} macro
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

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          macro: new fields.DocumentUUIDField({ type: "Macro" }),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
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
        return ["macro", ...super._formPaths, ...this._triggerDisplayPaths];
      }

      /** @inheritDoc */
      get _hasButtons() {
        return super._hasButtons && this.hasMacro;
      }

      /**
       * Convenience helper to check if this has a macro.
       * @returns {boolean}
       */
      get hasMacro() {
        return this.macro && !!fromUuidSync(this.macro);
      }

      /** @inheritDoc */
      async _getActivations() {
        const macro = await resolveDocument(this.macro);
        return [
          new MacroActivation({
            display: { label: this.display.label || macro?.name || this.label },
            macro: this.macro,
          }),
        ];
      }

      /** @inheritDoc */
      async _preFire(scope) {
        if (scope.awaitFire) await this.executeMacro(scope);
        else this.executeMacro(scope);
      }

      /** @inheritDoc */
      canFire(trigger) {
        return super.canFire(trigger) && this.hasMacro;
      }

      /**
       * Execute the macro.
       * @param {Teriock.System.TriggerScope} scope
       * @return {Promise<void>}
       */
      async executeMacro(scope = {}) {
        if (!this.hasMacro) return;
        const macro = await fromUuid(this.macro);
        await macro.execute(this.getScope(scope));
      }
    }
  );
}
