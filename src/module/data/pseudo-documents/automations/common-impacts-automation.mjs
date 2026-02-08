import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {Set<Teriock.Parameters.Consequence.CommonImpactKey>} common
 */
export default class CommonImpactsAutomation extends BaseAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "Common Impacts";
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
          choices: TERIOCK.options.consequence.common,
        }),
        {
          label: "Impacts",
          hint: "Simple one-off effects that don't require customization.",
        },
      ),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["common"];
  }
}
