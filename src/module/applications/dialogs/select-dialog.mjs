import { TeriockDialog } from "../api/_module.mjs";

const { fields } = foundry.data;

/**
 * Dialog that lets you select something.
 * @param {Record<string, string>} choices - Key/value pairs to select from.
 * @param {object} [options] - Dialog options.
 * @param {string|null} [options.initial=null] - The initially selected choice.
 * @param {string} [options.label="Select"] - Label for the select field.
 * @param {string} [options.hint="Please select an option above."] - Hint text.
 * @param {string} [options.title="Select"] - Dialog title.
 * @param {boolean} [options.other=false] - Whether to include an "Other" button.
 * @param {boolean} [options.genericOther=true] - If true, "Other" returns `null` instead of prompting again.
 * @returns {Promise<string|null>} The chosen value, or `null` if canceled or genericOther.
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
    return await TeriockDialog.prompt({
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

  return await TeriockDialog.prompt({
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

          return await TeriockDialog.prompt({
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
 * @returns {Promise<Teriock.Parameters.Equipment.EquipmentClass>}
 */
export async function selectEquipmentClassDialog() {
  return await selectDialog(CONFIG.TERIOCK.index.equipmentClasses, {
    label: "Equipment Class",
    hint: "Please select an equipment class.",
    title: "Select Equipment Class",
  });
}

/**
 * Select weapon class dialog.
 * @returns {Promise<Teriock.Parameters.Equipment.WeaponClass>}
 */
export async function selectWeaponClassDialog() {
  return await selectDialog(CONFIG.TERIOCK.index.weaponClasses, {
    label: "Weapon Class",
    hint: "Please select a weapon class.",
    title: "Select Weapon Class",
  });
}

/**
 * Select condition dialog.
 * @returns {Promise<Teriock.Parameters.Condition.ConditionKey>}
 */
export async function selectConditionDialog() {
  return await selectDialog(CONFIG.TERIOCK.index.conditions, {
    label: "Condition",
    hint: "Please select a condition.",
    title: "Select Condition",
  });
}

/**
 * Select property dialog.
 * @returns {Promise<Teriock.Parameters.Equipment.PropertyKey>}
 */
export async function selectPropertyDialog() {
  return await selectDialog(CONFIG.TERIOCK.index.properties, {
    label: "Property",
    hint: "Please select a property.",
    title: "Select Property",
    other: true,
    genericOther: true,
  });
}

/**
 * Select tradecraft dialog.
 * @returns {Promise<Teriock.Parameters.Fluency.Tradecraft>}
 */
export async function selectTradecraftDialog() {
  return await selectDialog(CONFIG.TERIOCK.index.tradecrafts, {
    label: "Tradecraft",
    hint: "Please select a tradecraft.",
    title: "Select Tradecraft",
  });
}

/**
 * Select ability dialog.
 * @returns {Promise<string>}
 */
export async function selectAbilityDialog() {
  return await selectDialog(CONFIG.TERIOCK.index.abilities, {
    label: "Ability",
    hint: "Please select an ability.",
    title: "Select Ability",
    other: true,
    genericOther: true,
  });
}

/**
 * Select equipment dialog.
 * @returns {Promise<string>}
 */
export async function selectEquipmentTypeDialog() {
  return await selectDialog(CONFIG.TERIOCK.index.equipment, {
    label: "Equipment Type",
    hint: "Please select an equipment type.",
    title: "Select Equipment Type",
    other: true,
    genericOther: false,
  });
}

/**
 * Select class dialog.
 * @returns {Promise<string>}
 */
export async function selectClassDialog() {
  return await selectDialog(CONFIG.TERIOCK.index.classes, {
    label: "Class",
    hint: "Please select a class.",
    title: "Select Class",
  });
}
