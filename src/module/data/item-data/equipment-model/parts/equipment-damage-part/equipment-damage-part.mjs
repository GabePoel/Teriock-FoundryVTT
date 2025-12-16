import { TeriockRoll } from "../../../../../dice/_module.mjs";
import { getRollIcon, makeIcon } from "../../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;
const { utils } = foundry;

/**
 * Equipment damage part.
 * Handles all damage-related functionality including two-handed attacks, damage deriving, migrations, and UI.
 * @param {typeof TeriockEquipmentModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockEquipmentModel}
     * @implements {EquipmentDamagePartInterface}
     * @mixin
     */
    class EquipmentDamagePart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          damage: new fields.SchemaField({
            base: new EvaluationField({
              deterministic: false,
            }),
            twoHanded: new EvaluationField({
              deterministic: false,
            }),
            types: new fields.SetField(new fields.StringField()),
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        if (
          utils.hasProperty(data, "damage") &&
          utils.getType(data.damage) === "string"
        ) {
          data.damage = { base: { saved: data.damage } };
        }
        if (
          utils.hasProperty(data, "twoHandedDamage") &&
          utils.getType(utils.getProperty(data, "twoHandedDamage")) === "string"
        ) {
          if (typeof data.damage !== "object") {
            data.damage = {};
          }
          data.damage.twoHanded = {
            saved: utils.getProperty(data, "twoHandedDamage"),
          };
          utils.deleteProperty(data, "twoHandedDamage");
        }
        if (utils.hasProperty(data, "damageTypes")) {
          if (typeof data.damage !== "object") {
            data.damage = {};
          }
          data.damage.types = data.damageTypes;
        }
        return super.migrateData(data);
      }

      /**
       * If this has a two-handed damage attack.
       * @returns {boolean}
       */
      get hasTwoHandedAttack() {
        return (
          this.damage.twoHanded.nonZero &&
          this.damage.twoHanded.formula !== this.damage.base.formula
        );
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        const entries = [
          {
            name: "Use in Two Hands",
            icon: makeIcon(
              getRollIcon(this.damage.twoHanded.formula),
              "contextMenu",
            ),
            callback: this.use.bind(this, { twoHanded: true }),
            condition: this.parent.isOwner && this.hasTwoHandedAttack,
            group: "usage",
          },
        ];
        return [...entries, ...super.getCardContextMenuEntries(doc)];
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          "dmg.2h": this.damage.twoHanded.formula,
        });
        return data;
      }

      /**
       * @inheritDoc
       * @returns {Teriock.Execution.EquipmentExecutionOptions}
       */
      parseEvent(event) {
        const options =
          /** @type {Teriock.Execution.EquipmentExecutionOptions} */
          super.parseEvent(event);
        Object.assign(options, {
          twoHanded: event.ctrlKey,
        });
        return options;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        for (const damageOption of ["base", "twoHanded"]) {
          const key = `damage.${damageOption}.raw`;
          const damageRoll = new TeriockRoll(utils.getProperty(this, key));
          damageRoll.terms.forEach((term) => {
            const flavorParts = new Set([
              ...term.flavor
                .toLowerCase()
                .split(" ")
                .map((p) => p.trim()),
              ...this.damage.types.map((t) => t.toLowerCase().trim()),
            ]);
            flavorParts.delete("");
            if (this.powerLevel === "magic") {
              flavorParts.add("magic");
            }
            const flavorArray = Array.from(flavorParts);
            flavorArray.sort((a, b) => a.localeCompare(b));
            if (!term.isDeterministic || !isNaN(Number(term.expression))) {
              term.options.flavor = flavorArray.join(" ");
            }
          });
          utils.setProperty(this, key, damageRoll.formula);
        }
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        if (!this.hasTwoHandedAttack) {
          this.damage.twoHanded.raw = this.damage.base.raw;
        }
      }
    }
  );
};
