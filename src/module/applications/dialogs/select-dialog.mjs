import { abilities } from "../../helpers/constants/generated/abilities.mjs";
import { conditions } from "../../helpers/constants/generated/conditions.mjs";
import { equipmentclasses } from "../../helpers/constants/generated/equipment-classes.mjs";
import { equipment } from "../../helpers/constants/generated/equipment.mjs";
import { magicalProperties } from "../../helpers/constants/generated/magical-properties.mjs";
import { materialProperties } from "../../helpers/constants/generated/material-properties.mjs";
import { properties } from "../../helpers/constants/generated/properties.mjs";
import { weaponclasses } from "../../helpers/constants/generated/weapon-classes.mjs";

const { fields } = foundry.data;
const { DialogV2 } = foundry.applications.api;

/**
 * Dialog that lets you select something.
 *
 * @param {Record<string, string>} choices - Key and value pairs to select from.
 * @param {{
 *   initial?: string|null,
 *   label?: string,
 *   hint?: string,
 *   title?: string,
 *   other?: boolean,
 *   genericOther?: boolean
 * }} [options={}] - Dialog options.
 * @returns {Promise<string|null>} - The chosen value.
 */
export async function selectDialog(choices, options = {}) {
  const {
    initial = null,
    label = "Select",
    hint = "Please select an option above.",
    title = "Select",
    other = false,
    genericOther = true,
  } = options;

  const selectContentHtml = document.createElement("div");
  const selectField = new fields.StringField({
    label,
    hint,
    choices,
    initial,
  });
  selectContentHtml.append(selectField.toFormGroup({}, { name: "selected" }));

  if (!other) {
    return await DialogV2.prompt({
      window: { title },
      modal: true,
      content: selectContentHtml,
      ok: {
        callback: (_event, button) =>
          button.form.elements.namedItem("selected").value,
      },
    });
  }

  const otherContentHtml = document.createElement("div");
  const otherField = new fields.StringField({ label, hint });
  otherContentHtml.append(
    otherField.toFormGroup({ units: "other" }, { name: "other" }),
  );

  return await DialogV2.prompt({
    window: { title },
    modal: true,
    content: selectContentHtml,
    ok: {
      default: true,
      callback: (_event, button) =>
        button.form.elements.namedItem("selected").value,
    },
    buttons: [
      {
        action: "other",
        label: "Other",
        callback: async (_event, _button, dialog) => {
          dialog.classList.add("force-hidden");
          if (genericOther) return null;

          return await DialogV2.prompt({
            window: { title },
            modal: true,
            content: otherContentHtml,
            ok: {
              callback: (_event, button) =>
                button.form.elements.namedItem("other").value,
            },
          });
        },
      },
    ],
  });
}

/**
 * Select equipment class dialog.
 *
 * @returns {Promise<Teriock.EquipmentClass>}
 */
export async function selectEquipmentClassDialog() {
  return await selectDialog(equipmentclasses, {
    label: "Equipment Class",
    hint: "Please select an equipment class.",
    title: "Select Equipment Class",
  });
}

/**
 * Select weapon class dialog.
 *
 * @returns {Promise<Teriock.WeaponClass>}
 */
export async function selectWeaponClassDialog() {
  return await selectDialog(weaponclasses, {
    label: "Weapon Class",
    hint: "Please select a weapon class.",
    title: "Select Weapon Class",
  });
}

/**
 * Select condition dialog.
 *
 * @returns {Promise<Teriock.ConditionKey>}
 */
export async function selectConditionDialog() {
  return await selectDialog(conditions, {
    label: "Condition",
    hint: "Please select a condition.",
    title: "Select Condition",
  });
}

/**
 * Select property dialog.
 *
 * @returns {Promise<Teriock.GenericPropertyKey|Teriock.MaterialPropertyKey|Teriock.MagicalPropertyKey>}
 */
export async function selectPropertyDialog() {
  return await selectDialog(
    foundry.utils.mergeObject(
      foundry.utils.mergeObject(properties, magicalProperties),
      materialProperties,
    ),
    {
      label: "Property",
      hint: "Please select a property.",
      title: "Select Property",
      other: true,
      genericOther: true,
    },
  );
}

/**
 * Select tradecraft dialog.
 *
 * @returns {Promise<Teriock.Tradecraft>}
 */
export async function selectTradecraftDialog() {
  return await selectDialog(CONFIG.TERIOCK.tradecraftOptionsList, {
    label: "Tradecraft",
    hint: "Please select a tradecraft.",
    title: "Select Tradecraft",
  });
}

/**
 * Select ability dialog.
 *
 * @returns {Promise<string>}
 */
export async function selectAbilityDialog() {
  return await selectDialog(abilities, {
    label: "Ability",
    hint: "Please select an ability.",
    title: "Select Ability",
    other: true,
    genericOther: true,
  });
}

/**
 * Select equipment dialog.
 *
 * @returns {Promise<string>}
 */
export async function selectEquipmentTypeDialog() {
  return await selectDialog(equipment, {
    label: "Equipment Type",
    hint: "Please select an equipment type.",
    title: "Select Equipment Type",
    other: true,
    genericOther: false,
  });
}

/**
 * Select class dialog.
 *
 * @returns {Promise<string>}
 */
export async function selectClassDialog() {
  return await selectDialog(CONFIG.TERIOCK.rankOptionsList, {
    label: "Class",
    hint: "Please select a class.",
    title: "Select Class",
  });
}
