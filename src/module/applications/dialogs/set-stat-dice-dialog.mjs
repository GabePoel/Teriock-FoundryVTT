import { dieOptions } from "../../constants/options/die-options.mjs";
import { TeriockDialog } from "../api/_module.mjs";

const { fields } = foundry.data;

/**
 * Dialog that sets {@link StatDieModel} values.
 * @param {TeriockItem & {system: StatDataMixin}} statItem
 * @param {Teriock.Parameters.Shared.DieStat} stat
 * @param {number} initialNumber
 * @param {Teriock.RollOptions.PolyhedralDieFaces} initialFaces
 */
export default async function setStatDiceDialog(
  statItem,
  stat,
  initialNumber,
  initialFaces,
) {
  const content = document.createElement("div");
  const numberField = new fields.NumberField({
    initial: initialNumber,
    min: 1,
    integer: true,
    label: "Number",
    hint: `Number of ${dieOptions.stats[stat]} dice.`,
  });
  const facesField = new fields.NumberField({
    initial: initialFaces,
    label: "Faces",
    hint: `How many faces the ${dieOptions.stats[stat]} dice have.`,
    choices: dieOptions.faces,
  });
  content.append(numberField.toFormGroup({}, { name: "number" }));
  content.append(facesField.toFormGroup({}, { name: "faces" }));
  await TeriockDialog.prompt({
    window: { title: `Set ${dieOptions.stats[stat]} Dice` },
    modal: true,
    content: content,
    ok: {
      label: "Apply",
      callback: async (_event, button) => {
        const number = Math.max(
          Math.floor(Number(button.form.elements.namedItem("number").value)),
          1,
        );
        const faces = Number(button.form.elements.namedItem("faces").value);
        // await statItem.update({
        //   [`system.${stat}DiceBase.number`]: number,
        //   [`system.${stat}DiceBase.faces`]: faces,
        // });
        await statItem.system.setDice(stat, number, faces);
      },
    },
  });
}
