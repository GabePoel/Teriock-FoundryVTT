import { pseudoHooks } from "../../../../constants/system/pseudo-hooks.mjs";
import { ExecuteMacroHandler } from "../../../../helpers/interaction/button-handlers/execute-macro-handlers.mjs";
import LabelAutomationMixin from "./label-automation-mixin.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseAutomation} Base
 * @constructor
 */
export default function MacroAutomationMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseAutomation}
     * @mixin
     * @property {"button"|"pseudoHook"} relation
     * @property {Teriock.Parameters.Shared.AbilityPseudoHook} pseudoHook
     * @property {UUID<TeriockMacro>} macro
     * @property {string} title
     */
    class MacroAutomation extends LabelAutomationMixin(Base) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.MacroAutomation",
      ];

      /** @inheritDoc */
      static get LABEL() {
        return "TERIOCK.AUTOMATIONS.MacroAutomation.LABEL";
      }

      /**
       * Viable pseudo-hook choices.
       * @returns {Record<string, string>}
       */
      static get _pseudoHookChoices() {
        return pseudoHooks;
      }

      /** @inheritDoc */
      static get metadata() {
        return Object.assign(super.metadata, {
          macro: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        const schema = Object.assign(super.defineSchema(), {
          macro: new fields.DocumentUUIDField({ type: "Macro" }),
        });
        if (Object.keys(this._pseudoHookChoices).length > 0) {
          Object.assign(schema, {
            relation: new fields.StringField({
              choices: {
                button: "Button",
                pseudoHook: "Hook",
              },
              initial: "button",
              label: "TERIOCK.AUTOMATIONS.BaseAutomation.FIELDS.relation.label",
            }),
            pseudoHook: new fields.StringField({
              choices: this._pseudoHookChoices,
            }),
          });
        }
        return schema;
      }

      /** @inheritDoc */
      get _formPaths() {
        const paths = ["macro", "relation"];
        if (this.relation === "pseudoHook") {
          paths.push("pseudoHook");
        } else {
          paths.push("title");
        }
        return paths;
      }

      /** @inheritDoc */
      get buttons() {
        if (this.relation !== "pseudoHook" && this.hasMacro) {
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
        } else {
          return [];
        }
      }

      /**
       * Convenience helper to check if this has a macro.
       * @returns {boolean}
       */
      get hasMacro() {
        return this.macro && !!fromUuidSync(this.macro);
      }
    }
  );
}
