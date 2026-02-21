import { characterOptions } from "../../../../../../constants/options/character-options.mjs";
import { prefixObject } from "../../../../../../helpers/utils.mjs";
import { FormulaField } from "../../../../../fields/_module.mjs";
import { PiercingModel } from "../../../../../models/_module.mjs";
import { migratePiercing } from "../../../../../shared/migrations/migrate-piercing.mjs";

const { fields } = foundry.data;
const { utils } = foundry;

/**
 * Actor data model that handles combat.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     * @implements {ActorCombatPartInterface}
     * @mixin
     */
    class ActorCombatPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          combat: new fields.SchemaField({
            attackPenalty: new fields.NumberField({
              initial: 0,
              integer: true,
              max: 0,
            }),
            hasReaction: new fields.BooleanField({ initial: true }),
          }),
          initiative: new FormulaField({
            initial: characterOptions.initiative,
            deterministic: false,
          }),
          offense: new fields.SchemaField({
            sb: new fields.BooleanField({ initial: false }),
            piercing: new fields.EmbeddedDataField(PiercingModel),
          }),
          wielding: new fields.SchemaField({
            attacker: new fields.DocumentIdField({ nullable: true }),
            blocker: new fields.DocumentIdField({ nullable: true }),
          }),
        });
      }

      /**
       * @inheritDoc
       * @param {object} data
       */
      static migrateData(data) {
        if (
          utils.getType(utils.getProperty(data, "wielding.attacker.raw")) ===
          "string"
        ) {
          utils.setProperty(
            data,
            "wielding.attacker",
            utils.getProperty(data, "wielding.attacker.raw"),
          );
        } else if (
          utils.getType(utils.getProperty(data, "wielding.attacker")) ===
          "Object"
        ) {
          utils.setProperty(data, "wielding.attacker", null);
        }
        if (
          utils.getType(utils.getProperty(data, "wielding.blocker.raw")) ===
          "string"
        ) {
          utils.setProperty(
            data,
            "wielding.blocker",
            utils.getProperty(data, "wielding.blocker.raw"),
          );
        } else if (
          utils.getType(utils.getProperty(data, "wielding.blocker")) ===
          "Object"
        ) {
          utils.setProperty(data, "wielding.blocker", null);
        }
        data.offense = migratePiercing(data.offense);
        super.migrateData(data);
      }

      /**
       * Primary attacking item.
       * @returns {TeriockArmament|null}
       */
      get primaryAttacker() {
        if (this.wielding.attacker) {
          const item = /** @type {TeriockArmament} */ this.parent.items.get(
            this.wielding.attacker,
          );
          if (item?.type === "body" || item?.system.equipped) {
            return item;
          }
        }
        return null;
      }

      /**
       * Primary blocking item.
       * @returns {TeriockArmament|null}
       */
      get primaryBlocker() {
        if (this.wielding.blocker) {
          const item = /** @type {TeriockArmament} */ this.parent.items.get(
            this.wielding.blocker,
          );
          if (item?.type === "body" || item?.system.equipped) {
            return item;
          }
        }
        return null;
      }

      /**
       * Get defense roll data.
       * @returns {object}
       */
      #getDefenseRollData() {
        return {
          av: this.defense.av.value,
          "av.worn": this.defense.av.worn,
          "av.nat": this.defense.av.natural,
          ac: this.defense.ac,
          bv: this.defense.bv,
          cc: this.defense.cc,
        };
      }

      /**
       * Get equipment roll data.
       * @returns {object}
       */
      #getEquipmentRollData() {
        const data = {};
        if (this.primaryAttacker) {
          Object.assign(
            data,
            prefixObject(this.primaryAttacker.system.getLocalRollData(), "atk"),
          );
        }
        if (this.primaryBlocker) {
          Object.assign(
            data,
            prefixObject(this.primaryBlocker.system.getLocalRollData(), "blk"),
          );
        }
        return data;
      }

      /**
       * Get offense roll data.
       * @returns {object}
       */
      #getOffenseRollData() {
        const weaponAv0 = this.primaryAttacker
          ? this.primaryAttacker.system.piercing.av0
          : false;
        const naturalAv0 =
          this.offense.piercing === "av0" || this.offense.piercing === "ub";
        const hasAv0 = weaponAv0 || naturalAv0;
        const weaponUb = this.primaryAttacker
          ? this.primaryAttacker.system.piercing.ub
          : false;
        const naturalUb = this.offense.piercing === "ub";
        const hasUb = weaponUb || naturalUb;
        const weaponWarded = this.primaryAttacker
          ? this.primaryAttacker.system.warded
          : false;
        return {
          sb: Number(this.offense.sb),
          av0: Number(hasAv0) * 2,
          "av0.wep": Number(weaponAv0) * 2,
          "av0.abi": 0,
          "av0.nat": Number(naturalAv0) * 2,
          ub: Number(hasUb),
          "ub.wep": Number(weaponUb),
          "ub.abi": 0,
          "ub.nat": Number(naturalUb),
          ward: Number(weaponWarded),
          "ward.wep": Number(weaponWarded),
          "ward.abi": 0,
          ap: this.combat.attackPenalty,
        };
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        Object.assign(rollData, {
          ...this.#getDefenseRollData(),
          ...this.#getOffenseRollData(),
          ...this.#getEquipmentRollData(),
        });
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        const armor = this.parent.equipment.filter(
          (e) => e.system.equipped && e.system.equipmentClasses.has("armor"),
        );
        const baseAv = Math.max(armor.map((a) => a.system.av.value));
        this.defense = {
          av: {
            base: baseAv,
            natural: 0,
            value: 0,
            worn: 0,
          },
          ac: 10,
          bv: 0,
          cc: 10,
        };
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        const armor = this.parent.equipment.filter(
          (e) => e.system.equipped && e.system.equipmentClasses.has("armor"),
        );
        const naturalArmor = this.parent.bodyParts.filter(
          (a) => !a.disabled && a.system.av.value > 0,
        );
        if (armor.length > 0) {
          this.defense.av.worn = Math.max(
            ...armor.map((a) => a.system.av.value),
          );
        }
        if (naturalArmor.length > 0) {
          this.defense.av.natural = Math.max(
            ...naturalArmor.map((a) => a.system.av.value),
          );
        }
        this.defense.av.value = Math.max(
          this.defense.av.natural,
          this.defense.av.worn,
        );
        this.defense.ac += this.defense.av.value;
        this.defense.bv = this.primaryBlocker?.system.bv.value || 0;
        this.defense.cc = this.defense.ac + this.defense.bv;
      }
    }
  );
};
