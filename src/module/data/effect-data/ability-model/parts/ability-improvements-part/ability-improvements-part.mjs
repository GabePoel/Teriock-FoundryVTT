import { TextField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability improvements part.
 * @param {typeof TeriockAbilityModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockAbilityModel}
     * @implements {AbilityImprovementsPartInterface}
     * @mixin
     */
    class AbilityImprovementsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          improvements: new fields.SchemaField({
            attributeImprovement: new fields.SchemaField({
              attribute: new fields.StringField({
                initial: null,
                nullable: true,
                choices: TERIOCK.index.statAttributes,
              }),
              minVal: new fields.NumberField({ initial: 0 }),
              text: new TextField({
                initial: "",
                label: "Attribute Improvement",
              }),
            }),
            featSaveImprovement: new fields.SchemaField({
              attribute: new fields.StringField({
                initial: null,
                nullable: true,
                choices: TERIOCK.index.attributes,
              }),
              amount: new fields.StringField({ initial: "proficient" }),
              text: new TextField({
                initial: "",
                label: "Feat Save Improvement",
              }),
            }),
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      get changes() {
        const changes = super.changes;
        if (this.improvements.attributeImprovement.attribute) {
          const attributeImprovementChange = {
            key: `system.attributes.${this.improvements.attributeImprovement.attribute}.score`,
            value: `${this.improvements.attributeImprovement.minVal}`,
            mode: 4,
            priority: 20,
          };
          changes.push(attributeImprovementChange);
        }
        if (this.improvements.featSaveImprovement.attribute) {
          const amount = this.improvements.featSaveImprovement.amount;
          const saveKey = amount === "fluency" ? "fluent" : "proficient";
          const featSaveImprovementChange = {
            key: `system.attributes.${this.improvements.featSaveImprovement.attribute}.${saveKey}`,
            value: "true",
            mode: 4,
            priority: 20,
          };
          changes.push(featSaveImprovementChange);
        }
        return changes;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.improvements.attributeImprovement.attribute) {
          const att = this.improvements.attributeImprovement.attribute;
          const minVal = this.improvements.attributeImprovement.minVal;
          this.improvements.attributeImprovement.text =
            `This ability sets your @L[Core:${att.toUpperCase()}] score ` +
            `to a minimum of ${minVal}.`;
        } else {
          this.improvements.attributeImprovement.text = "";
        }
        if (this.improvements.featSaveImprovement.attribute) {
          const att = this.improvements.featSaveImprovement.attribute;
          const amount = this.improvements.featSaveImprovement.amount;
          const amountVal =
            TERIOCK.options.ability.featSaveImprovementAmount[amount];
          this.improvements.featSaveImprovement.text =
            `This ability gives you @L[Core:${amountVal} Bonus]{${amount}} in ` +
            `@L[Core:${att.toUpperCase()}] @L[Core:Feat Interaction]{feat saves}.`;
        } else {
          this.improvements.featSaveImprovement.text = "";
        }
      }
    }
  );
};
