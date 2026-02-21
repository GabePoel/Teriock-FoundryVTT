import { getRollIcon, makeIcon } from "../../../../../../helpers/utils.mjs";
import { damageField } from "../../../../../fields/helpers/builders.mjs";

const { utils } = foundry;

/**
 * Equipment damage part.
 * Handles all damage-related functionality including two-handed attacks, damage deriving, migrations, and UI.
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {EquipmentSystem}
     * @implements {EquipmentDamagePartInterface}
     * @mixin
     */
    class EquipmentDamagePart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          damage: damageField(true),
        });
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

      /** @inheritDoc */
      static parseEvent(event) {
        return Object.assign(super.parseEvent(event), {
          twoHanded: event.altKey,
        });
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
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.Equipment.USAGE.twoHanded",
            ),
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

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        if (this.hasTwoHandedAttack) {
          this.damage.twoHanded.addTypes(this.damage.types);
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
