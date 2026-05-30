import { config } from "../../../../../../constants/_module.mjs";
import scalingConfig from "../../../../../../constants/config/scaling-config.mjs";
import { prefixObject } from "../../../../../../helpers/utils.mjs";
import { FormulaField, LocalDocumentField } from "../../../../../fields/_module.mjs";
import { initialNumber, initialSchema } from "../../../../../fields/helpers/initializers.mjs";
import { PiercingModel } from "../../../../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Determine if a wielded document should be null.
 * @param {TeriockArmament} doc
 */
function nullifyWielded(doc) {
  if (!["body", "equipment"].includes(doc.type) || !doc.active) { return true; }
  return doc.type === "equipment" && !doc.system.equipped;
}

/**
 * Actor data model that handles combat.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorCombatPartData}
     * @mixin
     */
    class ActorCombatPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          combat: new fields.SchemaField({
            attackPenalty: new fields.NumberField({ initial: 0, integer: true, max: 0 }),
            hasReaction: new fields.BooleanField({ initial: true }),
          }),
          defense: initialSchema({
            ac: initialNumber(scalingConfig.baseValues.ac),
            av: initialSchema({
              base: initialNumber(),
              natural: initialNumber(),
              value: initialNumber(),
              worn: initialNumber(),
            }),
            bv: initialNumber(),
            cc: initialNumber(scalingConfig.baseValues.ac),
          }),
          initiative: new FormulaField({ deterministic: false, initial: config.character.defaults.initiative }),
          offense: new fields.SchemaField({
            piercing: new fields.EmbeddedDataField(PiercingModel),
            sb: new fields.BooleanField({ initial: false }),
            warded: new fields.BooleanField({ initial: false }),
          }),
          wielding: new fields.SchemaField({
            attacker: new LocalDocumentField(foundry.documents.BaseItem, { nullify: nullifyWielded }),
            blocker: new LocalDocumentField(foundry.documents.BaseItem, { nullify: nullifyWielded }),
          }),
        });
      }

      /**
       * Get defense roll data.
       * @returns {object}
       */
      #getDefenseRollData() {
        return {
          ac: this.defense.ac,
          av: this.defense.av.value,
          "av.nat": this.defense.av.natural,
          "av.worn": this.defense.av.worn,
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
        const { attacker, blocker } = this.wielding;
        if (attacker) { Object.assign(data, prefixObject(attacker.system.getLocalRollData(), "atk")); }
        if (blocker) { Object.assign(data, prefixObject(blocker.system.getLocalRollData(), "blk")); }
        return data;
      }

      /**
       * Get offense roll data.
       * @returns {object}
       */
      #getOffenseRollData() {
        const weaponAv0 = Boolean(this.wielding.attacker?.system.piercing.av0);
        const naturalAv0 = this.offense.piercing.av0;
        const hasAv0 = weaponAv0 || naturalAv0;
        const weaponUb = Boolean(this.wielding.attacker?.system.piercing.ub);
        const naturalUb = this.offense.piercing.ub;
        const hasUb = weaponUb || naturalUb;
        const weaponWarded = Boolean(this.wielding.attacker?.system.warded);
        return {
          ap: this.combat.attackPenalty,
          av0: Number(hasAv0) * 2,
          "av0.abi": 0,
          "av0.nat": Number(naturalAv0) * 2,
          "av0.wep": Number(weaponAv0) * 2,
          sb: this.offense.sb ? this.scaling.p : 0,
          ub: Number(hasUb),
          "ub.abi": 0,
          "ub.nat": Number(naturalUb),
          "ub.wep": Number(weaponUb),
          ward: Number(weaponWarded),
          "ward.abi": 0,
          "ward.wep": Number(weaponWarded),
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
        const armor = this.parent.equipment.filter(e => e.system.equipped && e.system.equipmentClasses.has("armor"));
        this.defense.av.base = Math.max(armor.map(a => a.system.av.value));
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.defense.av.worn = Math.max(
          0,
          ...this.parent.equipment.filter(e => e.active && !e.system.shattered).map(e => e.system.av.value),
        );
        this.defense.av.natural = Math.max(
          0,
          ...this.parent.bodyParts.filter(b => b.active).map(b => b.system.av.value),
        );
        this.defense.av.value = Math.max(0, this.defense.av.natural, this.defense.av.worn);
        this.defense.ac += this.defense.av.value;
        this.defense.bv = this.wielding.blocker?.system.bv.value || 0;
        this.defense.cc = this.defense.ac + this.defense.bv;
      }
    }
  );
};
