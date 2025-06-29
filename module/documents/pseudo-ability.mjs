const { fields } = foundry.data;
import Pseudo from "./pseudo.mjs";
import TeriockPseudoAbilityData from "../data/effect-data/ability-data/pseudo-ability-data.mjs";
import { EffectMixin } from "./mixins/effect-mixin.mjs";
import PseudoAbilitySheet from "../sheets/pseudo-sheets/pseudo-ability-sheet.mjs";

export default class PseudoAbility extends EffectMixin(Pseudo) {
  static DEPTH = 0;

  /**
   * Pseudo-document metadata.
   * @type {PseudoMetadata}
   */
    static get metadata() {
      return {
        documentName: "PseudoAbility",
        label: "",
        icon: "",
        embedded: {},
        sheetClass: PseudoAbilitySheet,
      };
    }

  /** @inheritdoc */
  static defineSchema(depth = this.DEPTH) {
    console.log("PseudoAbility.defineSchema", depth);
    
    // Create a depth-aware data model
    class ChildPseudoAbilityData extends TeriockPseudoAbilityData {
      static DEPTH = depth;
    }
    console.log("ChildPseudoAbilityData.DEPTH", ChildPseudoAbilityData.DEPTH);

    return Object.assign(super.defineSchema(), {
      name: new fields.StringField({ initial: "" }),
      img: new fields.StringField({ initial: "" }),
      system: new fields.EmbeddedDataField(ChildPseudoAbilityData),
      disabled: new fields.BooleanField({
        initial: false,
      }),
      suppressed: new fields.BooleanField({
        initial: false,
      }),
    });
  }

  /** @inheritdoc */
  static async create(data = {}, { parent, ...operation } = {}) {
    const system = new TeriockPseudoAbilityData();
    Object.assign(data, { system });
    return super.create(data, { parent, ...operation });
  }

  // /** @inheritdoc */
  // prepareDerivedData() {
  //   super.prepareDerivedData();
  //   this.system = new TeriockPseudoAbilityData(this.system);
  //   this.system.parent = this;
  // }
}