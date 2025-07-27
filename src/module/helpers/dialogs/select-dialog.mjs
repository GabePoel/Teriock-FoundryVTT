const { fields } = foundry.data;
const { DialogV2 } = foundry.applications.api;
import { abilities } from "../constants/generated/abilities.mjs";
import { conditions } from "../constants/generated/conditions.mjs";
import { equipmentclasses } from "../constants/generated/equipment-classes.mjs";
import { magicalProperties } from "../constants/generated/magical-properties.mjs";
import { materialProperties } from "../constants/generated/material-properties.mjs";
import { properties } from "../constants/generated/properties.mjs";
import { weaponclasses } from "../constants/generated/weapon-classes.mjs";

/**
 * Dialog that lets you select something.
 *
 * @param {Record<string, string>} choices - Key and value pairs to select from.
 * @param {string} [label] - Label to use.
 * @param {string} [hint] - Hint to use.
 * @param {string} [title] - Title to use.
 * @param {boolean} [other] - If an "other" option should be provided.
 * @param {boolean} [genericOther] - If a generic `null` should be provided as the other result.
 * @returns {Promise<string|null>} - The chosen equipment class key.
 */
export async function selectDialog(
  choices,
  label = "Select",
  hint = "Please select an option above.",
  title = "Select",
  other = false,
  genericOther = true,
) {
  const selectContentHtml = document.createElement("div");
  const selectField = new fields.StringField({
    label: label,
    hint: hint,
    choices: choices,
  });
  selectContentHtml.append(selectField.toFormGroup({}, { name: "selected" }));
  const otherContentHtml = document.createElement("div");
  const otherField = new fields.StringField({
    label: label,
    hint: hint,
  });
  otherContentHtml.append(
    otherField.toFormGroup({ units: "other" }, { name: "other" }),
  );
  if (other) {
    return await DialogV2.prompt({
      window: { title: title },
      modal: true,
      content: selectContentHtml,
      ok: {
        default: true,
        callback: async (event, button) => {
          return button.form.elements.namedItem("selected").value;
        },
      },
      buttons: [
        {
          action: "other",
          label: "Other",
          callback: async (event, button, dialog) => {
            await dialog.classList.add("force-hidden");
            if (genericOther) {
              return null;
            }
            return await DialogV2.prompt({
              window: { title: title },
              modal: true,
              content: otherContentHtml,
              ok: {
                callback: (event, button) => {
                  return button.form.elements.namedItem("other").value;
                },
              },
            });
          },
        },
      ],
    });
  } else {
    return await DialogV2.prompt({
      window: { title: title },
      modal: true,
      content: selectContentHtml,
      ok: {
        callback: (event, button) => {
          return button.form.elements.namedItem("selected").value;
        },
      },
    });
  }
}

/**
 * Select equipment class dialog.
 *
 * @returns {Promise<string>}
 */
export async function selectEquipmentClassDialog() {
  return await selectDialog(
    equipmentclasses,
    "Equipment Class",
    "Please select an equipment class.",
    "Select Equipment Class",
  );
}

/**
 * Select weapon class dialog.
 *
 * @returns {Promise<string>}
 */
export async function selectWeaponClassDialog() {
  return await selectDialog(
    weaponclasses,
    "Weapon Class",
    "Please select a weapon class.",
    "Select Weapon Class",
  );
}

/**
 * Select condition dialog.
 *
 * @returns {Promise<string>}
 */
export async function selectConditionDialog() {
  return await selectDialog(
    conditions,
    "Condition",
    "Please select a condition.",
    "Select Condition",
  );
}

/**
 * Select property dialog.
 *
 * @returns {Promise<string>}
 */
export async function selectPropertyDialog() {
  return await selectDialog(
    foundry.utils.mergeObject(
      foundry.utils.mergeObject(properties, magicalProperties),
      materialProperties,
    ),
    "Property",
    "Please select a property.",
    "Select Property",
    true,
    true,
  );
}

/**
 * Select tradecraft dialog.
 *
 * @returns {Promise<string>}
 */
export async function selectTradecraftDialog() {
  return await selectDialog(
    CONFIG.TERIOCK.tradecraftOptionsList,
    "Tradecraft",
    "Please select a tradecraft.",
    "Select Tradecraft",
  );
}

/**
 * Select ability dialog.
 *
 * @returns {Promise<string>}
 */
export async function selectAbilityDialog() {
  return await selectDialog(
    abilities,
    "Ability",
    "Please select an ability.",
    "Select Ability",
    true,
    true,
  );
}
