const { DialogV2 } = foundry.applications.api;

/**
 * Dialog that sets the duration for an ability.
 *
 * @param {TeriockAbility} ability
 * @returns {Promise<void>}
 */
export default async function durationDialog(ability) {
  const contentHtml = document.createElement("div");
  contentHtml.append(
    ability.system.schema.fields.duration.fields.unit.toFormGroup(
      {},
      {
        name: "unit",
        value: ability.system.duration.unit,
      },
    ),
  );
  contentHtml.append(
    ability.system.schema.fields.duration.fields.quantity.toFormGroup(
      {},
      {
        name: "quantity",
        value: ability.system.duration.quantity,
      },
    ),
  );
  contentHtml.append(
    ability.system.schema.fields.duration.fields.conditions.fields.present.toFormGroup(
      {},
      {
        name: "present",
        value: ability.system.duration.conditions.present,
      },
    ),
  );
  contentHtml.append(
    ability.system.schema.fields.duration.fields.conditions.fields.absent.toFormGroup(
      {},
      {
        name: "absent",
        value: ability.system.duration.conditions.absent,
      },
    ),
  );
  contentHtml.append(
    ability.system.schema.fields.duration.fields.description.toFormGroup(
      {},
      {
        name: "description",
        value: ability.system.duration.description,
      },
    ),
  );
  try {
    await DialogV2.prompt({
      window: { title: "Set Duration" },
      modal: true,
      content: contentHtml,
      ok: {
        label: "Apply",
        callback: async (event, button) => {
          await ability.update({
            "system.duration.unit": button.form.elements.namedItem("unit").value,
            "system.duration.quantity": button.form.elements.namedItem("quantity").value,
            "system.duration.conditions.absent": button.form.elements.namedItem("absent").value,
            "system.duration.conditions.present": button.form.elements.namedItem("present").value,
            "system.duration.description": button.form.elements.namedItem("description").value,
          });
        },
      },
    });
  } catch {}
}
