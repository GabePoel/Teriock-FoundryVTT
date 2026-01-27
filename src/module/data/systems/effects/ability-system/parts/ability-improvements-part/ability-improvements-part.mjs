import { TextField } from "../../../../../fields/_module.mjs";
import {
  attributeField,
  competenceField,
} from "../../../../../fields/helpers/builders.mjs";

const { fields } = foundry.data;

/**
 * Ability improvements part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @implements {AbilityImprovementsPartInterface}
     * @mixin
     */
    class AbilityImprovementsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          upgrades: new fields.SchemaField({
            competence: new fields.SchemaField({
              attribute: attributeField(),
              text: new TextField({
                initial: "",
                label: "Attribute Competence Improvement",
                required: false,
              }),
              value: competenceField(),
            }),
            score: new fields.SchemaField({
              attribute: attributeField(),
              text: new TextField({
                initial: "",
                label: "Attribute Score Improvement",
                required: false,
              }),
              value: new fields.NumberField({
                hint: "The value of this attribute score.",
                initial: 0,
                label: "Score",
                max: 5,
                min: -3,
                required: false,
              }),
            }),
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        //noinspection JSUnresolvedReference
        if (data.improvements) {
          //noinspection JSUnresolvedReference
          data.upgrades = {
            competence: {
              attribute: data.improvements.featSaveImprovement.attribute,
              value: 1,
            },
            score: {
              attribute: data.improvements.attributeImprovement.attribute,
              value: data.improvements.attributeImprovement.minVal,
            },
          };
          switch (data.improvements.featSaveImprovement.amount) {
            case "fluency":
              data.upgrades.competence.value = 2;
              break;
            case "proficiency":
              data.upgrades.competence.value = 1;
              break;
            default:
              data.upgrades.competence.value = 0;
              break;
          }
          delete data.improvements;
        }
        super.migrateData(data);
      }

      /** @inheritDoc */
      get changes() {
        const changes = super.changes;
        if (this.upgrades.score.attribute) {
          changes.push({
            key: `system.attributes.${this.upgrades.score.attribute}.score`,
            mode: 4,
            priority: 20,
            qualifier: "1",
            target: "Actor",
            time: "normal",
            value: `${this.upgrades.score.value}`,
          });
        }
        if (this.upgrades.competence.attribute) {
          changes.push({
            key: `system.attributes.${this.upgrades.competence.attribute}.competence.raw`,
            mode: 4,
            priority: 20,
            qualifier: "1",
            target: "Actor",
            time: "normal",
            value: `${this.upgrades.competence.value}`,
          });
        }
        return changes;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.upgrades.score.attribute) {
          const att = this.upgrades.score.attribute;
          const minVal = this.upgrades.score.value;
          this.upgrades.score.text =
            `This ability sets your @L[Core:${att.toUpperCase()}] score ` +
            `to a minimum of ${minVal}.`;
        } else {
          this.upgrades.score.text = "";
        }
        if (this.upgrades.competence.value === 0) {
          this.upgrades.competence.attribute = null;
        }
        if (this.upgrades.competence.attribute) {
          const att = this.upgrades.competence.attribute;
          const amount = this.upgrades.competence.value;
          let amountPage = "Competence";
          if (amount === 1) {
            amountPage = "Proficiency";
          }
          if (amount === 2) {
            amountPage = "Fluency";
          }
          this.upgrades.competence.text =
            `This ability gives you @L[Core:${amountPage} Bonus]{${amountPage.toLowerCase()}} in ` +
            `@L[Core:${att.toUpperCase()}] @L[Core:Feat Interaction]{feat saves}.`;
        } else {
          this.upgrades.competence.text = "";
        }
      }
    }
  );
};
