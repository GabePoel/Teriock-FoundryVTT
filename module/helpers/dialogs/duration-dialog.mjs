import { conditions } from "../constants/generated/conditions.mjs";

const { fields } = foundry.data;
const { DialogV2 } = foundry.applications.api;

/**
 * Dialog that sets the duration for an ability.
 *
 * @param {TeriockAbility} ability
 * @returns {Promise<void>}
 */
export default async function durationDialog(ability) {
  const contentHtml = document.createElement("div");
  if (ability.system.maneuver === "passive") {
    const presentDurationsField = new fields.SetField(
      new fields.StringField({
        choices: conditions,
      }),
      {
        label: "Present Conditions",
        hint: "What conditions must be present in order for this ability to be active?",
      },
    );
    const absentDurationsField = new fields.SetField(
      new fields.StringField({
        choices: conditions,
      }),
      {
        label: "Absent Conditions",
        hint: "What conditions must be absent in order for this ability to be active?",
      },
    );
    const descriptionField = new fields.StringField({
      label: "Description",
      hint: "Custom description. Leave blank in order for the duration to be automatically generated.",
    });
    contentHtml.append(presentDurationsField.toFormGroup({}, { name: "present" }));
    contentHtml.append(absentDurationsField.toFormGroup({}, { name: "absent" }));
    contentHtml.append(descriptionField.toFormGroup({}, { name: "description" }));
    try {
      await DialogV2.prompt({
        window: { title: "Set Duration" },
        modal: true,
      });
    } catch {}
  }
}
