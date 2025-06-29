import PseudoAbility from "../../../../../documents/pseudo-ability.mjs";
import { teriockFields } from "../../../../shared/_module.mjs";
import PseudoAbilitySheet from "../../../../../sheets/pseudo-sheets/pseudo-ability-sheet.mjs";
  
export function _defineSub(schema, depth = 0) {
  if (depth < 10) {
    console.log("Defining sub schema for depth", depth);
    class ChildPseudoAbility extends PseudoAbility {
      static DEPTH = depth + 1;
      
      /** @inheritdoc */
      static defineSchema() {
        return super.defineSchema(this.DEPTH);
      }
      
      /** @inheritdoc */
      static get metadata() {
        return {
          ...super.metadata,
          sheetClass: PseudoAbilitySheet,
        };
      }
    }
    schema.children = new teriockFields.TeriockCollectionField(ChildPseudoAbility);
  }
  return schema;
}