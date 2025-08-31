import { abilityOptions } from "../../constants/ability-options.mjs";
import { conditions } from "../../constants/generated/conditions.mjs";

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
    ability.system.schema.fields.duration.fields.stationary.toFormGroup(
      {},
      {
        name: "stationary",
        value: ability.system.duration.stationary,
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
        callback: async (_event, button) => {
          let description =
            button.form.elements.namedItem("description").value.trim() || "";
          const quantity = button.form.elements.namedItem("quantity").value;
          const unit = button.form.elements.namedItem("unit").value;
          const present =
            /** @type {Teriock.Parameters.Condition.Key[]} */ button.form.elements.namedItem(
              "present",
            ).value;
          const absent =
            /** @type {Teriock.Parameters.Condition.Key[]} */ button.form.elements.namedItem(
              "absent",
            ).value;
          const stationaryElement =
            /** @type {HTMLInputElement} */ button.form.elements.namedItem(
              "stationary",
            );
          const stationary = stationaryElement.checked;
          if (description.length === 0) {
            description = `${abilityOptions.duration.unit[unit]}${quantity !== 1 && !["instant", "noLimit", "untilDawn"].includes(unit) ? "s" : ""}`;
            if (!["instant", "noLimit", "untilDawn"].includes(unit)) {
              description = `${quantity} ${description}`;
            }
            let conditionTerms = [
              ...present.map((k) => conditions[k]),
              ...absent.map((k) => "Not " + conditions[k]),
            ];
            conditionTerms = conditionTerms.map((c) => {
              if (c === "Not Down") return "Up";
              if (c === "Not Dead") return "Alive";
              if (c === "Not Unconscious") return "Conscious";
              return c;
            });
            if (stationary) conditionTerms.push("Stationary");
            let finalTerm = "";
            if (conditionTerms.length > 1) {
              finalTerm = " and " + conditionTerms.pop();
            }
            if (conditionTerms.length + finalTerm.length > 0) {
              if (unit === "noLimit") description = "";
              description += " While " + conditionTerms.join(", ");
              description += finalTerm;
            }
            if (ability.system.maneuver === "passive")
              description = description.replace("No Limit", "Always Active");
          }
          await ability.update({
            "system.duration.unit": unit,
            "system.duration.quantity": quantity,
            "system.duration.conditions.absent": absent,
            "system.duration.conditions.present": present,
            "system.duration.stationary": stationary,
            "system.duration.description": description,
          });
        },
      },
    });
  } catch {}
}
