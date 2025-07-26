const { fields } = foundry.data;
const { DialogV2 } = foundry.applications.api;
import { equipmentclasses } from "../constants/generated/equipment-classes.mjs";

/**
 * Dialog that lets you select an equipment class.
 *
 * @returns {Promise<string>} - The chosen equipment class key.
 */
export default async function equipmentClassDialog() {
  const contentHtml = document.createElement("div");
  const equipmentClassField = new fields.StringField({
    label: "Equipment Class",
    hint: "Please select an equipment class.",
    choices: equipmentclasses,
  });
  contentHtml.append(
    equipmentClassField.toFormGroup({}, { name: "equipmentClass" }),
  );
  return await DialogV2.prompt({
    window: { title: "Select Equipment Class" },
    modal: true,
    content: contentHtml,
    ok: {
      label: "Select",
      callback: (event, button) =>
        button.form.elements.namedItem("equipmentClass").value,
    },
  });
}
