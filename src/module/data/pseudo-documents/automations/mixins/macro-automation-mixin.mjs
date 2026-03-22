import { ExecuteMacroHandler } from "../../../../helpers/interaction/button-handlers/execute-macro-handlers.mjs";
import { lcFirst } from "../../../../helpers/string.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import LabelAutomationMixin from "./label-automation-mixin.mjs";
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
     * @mixes LabelAutomation
     * @mixin
     * @property {UUID<TeriockMacro>} macro
     * @property {string} title
     */
    class MacroAutomation extends mix(
      Base,
      TriggerAutomationMixin,
      LabelAutomationMixin,
    ) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.MacroAutomation",
      ];

      /** @inheritDoc */
      static get LABEL() {
        return "TERIOCK.AUTOMATIONS.MacroAutomation.LABEL";
      }

      /** @inheritDoc */
      static get metadata() {
        return Object.assign(super.metadata, {
          macro: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          macro: new fields.DocumentUUIDField({ type: "Macro" }),
        });
      }

      /** @inheritDoc */
      static migrateData(data) {
        if (data.pseudoHook) {
          data.trigger = data.pseudoHook;
        }
        if (data.relation === "pseudoHook") {
          data.relation = "trigger";
        }
        delete data.pseudoHook;
        if (data.trigger?.includes("equipment")) {
          data.trigger = data.trigger.replace("equipment", "");
          data.trigger = lcFirst(data.trigger);
        }
        if (data.trigger === "effectApplication") data.trigger = "applyEffect";
        if (data.trigger === "effectExpiration") data.trigger = "expireEffect";
        return super.migrateData(data);
      }

      /** @inheritDoc */
      get _formPaths() {
        let paths = ["macro", ...super._formPaths];
        if (this.trigger) paths = paths.filter((p) => p !== "title");
        return paths;
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
      async _getButtons() {
        return [
          ExecuteMacroHandler.buildButton(
            this.macro,
            {
              proficient: this.document?.system.competence?.proficient,
              fluent: this.document?.system.competence?.fluent,
            },
            { label: this.title },
          ),
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
