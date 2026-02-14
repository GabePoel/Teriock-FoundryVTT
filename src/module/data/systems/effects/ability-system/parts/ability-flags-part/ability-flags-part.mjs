import { TextField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability flags part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {AbilitySystem}
     * @implements {Teriock.Models.AbilityFlagsPartInterface}
     * @mixin
     */
    class AbilityFlagsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          class: new fields.StringField({
            choices: TERIOCK.options.ability.class,
          }),
          basic: new fields.BooleanField({
            initial: false,
            label: "Basic",
          }),
          consumable: new fields.BooleanField({
            initial: false,
            label: "Consumable",
          }),
          elderSorcery: new fields.BooleanField({
            initial: false,
            label: "Elder Sorcery",
          }),
          elderSorceryIncant: new TextField({
            initial: "",
            label: "With Elder Sorcery...",
          }),
          invoked: new fields.BooleanField({
            initial: false,
            label: "Invoked",
          }),
          ritual: new fields.BooleanField({
            initial: false,
            label: "Ritual",
          }),
          rotator: new fields.BooleanField({
            initial: false,
            label: "Rotator",
          }),
          skill: new fields.BooleanField({
            initial: false,
            label: "Skill",
          }),
          spell: new fields.BooleanField({
            initial: false,
            label: "Spell",
          }),
          standard: new fields.BooleanField({
            initial: false,
            label: "Standard",
          }),
          sustained: new fields.BooleanField({
            initial: false,
            label: "Sustained",
          }),
          sustaining: new fields.SetField(
            new fields.DocumentUUIDField({ type: "ActiveEffect" }),
          ),
          warded: new fields.BooleanField({
            initial: false,
            label: "Warded",
          }),
        });
      }

      /**
       * If this is a true basic ability.
       * @returns {boolean}
       */
      get isBasic() {
        return (
          this.basic &&
          this.parent.parent.name === "Basic Abilities" &&
          this.parent.inCompendium
        );
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          warded: Number(this.warded),
          basic: Number(this.basic),
          standard: Number(this.standard),
          skill: Number(this.skill),
          spell: Number(this.spell),
          ritual: Number(this.ritual),
          rotator: Number(this.rotator),
          sustained: Number(this.sustained),
          invoked: Number(this.invoked),
          elderSorcery: Number(this.elderSorcery),
          es: Number(this.elderSorcery),
        });
        if (this.parent.parent?.type === "rank") {
          const rank = /** @type {TeriockRank} */ this.parent.parent;
          data[`class.${rank.system.className.slice(0, 3).toLowerCase()}`] = 1;
          data[`class.${rank.system.className}`] = 1;
        }
        return data;
      }
    }
  );
};
