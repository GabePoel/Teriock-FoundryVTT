import { FormulaField } from "../../../../shared/fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Make the field for a color of stone in the Death Bag.
 * @param {Teriock.Parameters.Actor.DeathBagStoneColor} color
 * @param {number} initial
 * @returns {FormulaField}
 */
function stoneField(color, initial) {
  return new FormulaField({
    initial: `${initial}`,
    nullable: false,
    deterministic: false,
    label: `${TERIOCK.options.die.deathBagStoneColor[color]} Stones`,
    hint: `Number of ${color} stones in the Death Bag.`,
  });
}

/**
 * Defines the Death Bag schema.
 *
 * Relevant wiki pages:
 * - [Dead](https://wiki.teriock.com/index.php/Condition:Dead)
 *
 * @param {object} schema - The schema object ot extend with Death Bag fields
 * @returns {object} The modified schema object with Death Bag fields added
 */
export function _defineDeathBag(schema) {
  schema.deathBag = new fields.SchemaField({
    pull: new FormulaField({
      initial: "10",
      nullable: false,
      deterministic: false,
      label: "Stones to Pull",
      hint: "Total number of stones to pull from the Death Bag.",
    }),
    stones: new fields.SchemaField({
      black: stoneField("black", 3),
      red: stoneField("red", 10),
      white: stoneField("white", 10),
    }),
  });
  return schema;
}