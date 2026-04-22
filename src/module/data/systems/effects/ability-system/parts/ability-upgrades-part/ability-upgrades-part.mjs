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
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityUpgradesPartData}
     * @mixin
     */
    class AbilityUpgradesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          upgrades: new fields.SchemaField({
            competence: new fields.SchemaField({
              attribute: attributeField(),
              text: new TextField({
                initial: "",
                persisted: false,
                required: false,
              }),
              value: competenceField(),
            }),
            score: new fields.SchemaField({
              attribute: attributeField(),
              text: new TextField({
                initial: "",
                persisted: false,
                required: false,
              }),
              value: new fields.NumberField({
                initial: 0,
                max: 5,
                min: -3,
                nullable: false,
              }),
            }),
          }),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        //noinspection JSUnresolvedReference
        if (source.improvements) {
          //noinspection JSUnresolvedReference
          source.upgrades = {
            competence: {
              attribute: source.improvements.featSaveImprovement.attribute,
              value: 1,
            },
            score: {
              attribute: source.improvements.attributeImprovement.attribute,
              value: source.improvements.attributeImprovement.minVal,
            },
          };
          switch (source.improvements.featSaveImprovement.amount) {
            case "fluency":
              source.upgrades.competence.value = 2;
              break;
            case "proficiency":
              source.upgrades.competence.value = 1;
              break;
            default:
              source.upgrades.competence.value = 0;
              break;
          }
          delete source.improvements;
        }
        return super.migrateData(source, options, state);
      }

      /** @inheritDoc */
      get canChange() {
        return (
          super.canChange ||
          !!this.upgrades.score.attribute ||
          !!this.upgrades.competence.attribute
        );
      }

      /** @inheritDoc */
      get qualifiedChanges() {
        const changes = super.qualifiedChanges;
        if (this.upgrades.score.attribute) {
          changes.push({
            key: `system.attributes.${this.upgrades.score.attribute}.score`,
            priority: 20,
            qualifier: "1",
            target: "Actor",
            time: "normal",
            type: "upgrade",
            value: `${this.upgrades.score.value}`,
          });
        }
        if (this.upgrades.competence.attribute) {
          changes.push({
            key: `system.attributes.${this.upgrades.competence.attribute}.competence.raw`,
            priority: 20,
            qualifier: "1",
            target: "Actor",
            time: "normal",
            type: "upgrade",
            value: `${this.upgrades.competence.value}`,
          });
        }
        return changes;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.upgrades.score.attribute) {
          const attShort = this.upgrades.score.attribute.toUpperCase();
          const attLabel =
            TERIOCK.config.attribute[this.upgrades.score.attribute].label;
          const attribute = ` @L[Core:${attShort}]{${attLabel}}`;
          const value = this.upgrades.score.value;
          this.upgrades.score.text = _loc(
            "TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.score.description",
            { attribute, value },
          );
        } else {
          this.upgrades.score.text = "";
        }
        if (this.upgrades.competence.value === 0) {
          this.upgrades.competence.attribute = null;
        }
        if (this.upgrades.competence.attribute) {
          const att = this.upgrades.competence.attribute.toUpperCase();
          const attLabel =
            TERIOCK.config.attribute[this.upgrades.competence.attribute].label;
          const attribute = ` @L[Core:${att}]{${attLabel}}`;
          const amount = this.upgrades.competence.value;
          const page = TERIOCK.config.competence.levels[amount].page;
          const level = TERIOCK.config.competence.levels[amount].label;
          const upgrade = `@L[Core:${page}]{${level.toLowerCase()}}`;
          const savesLabel = _loc(
            "TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.competence.saves",
          );
          const saves = `@L[Core:Feat Interaction]{${savesLabel}}`;
          this.upgrades.competence.text = _loc(
            "TERIOCK.SYSTEMS.Ability.FIELDS.upgrades.competence.description",
            { attribute, saves, upgrade },
          );
        } else {
          this.upgrades.competence.text = "";
        }
      }
    }
  );
};
