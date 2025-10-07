import { getAbility, getItem, getProperty } from "../../helpers/fetch.mjs";
import { classPanel, tradecraftPanel } from "../../helpers/html.mjs";
import { getIcon } from "../../helpers/path.mjs";
import { toCamelCase } from "../../helpers/string.mjs";
import { TeriockDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";
import { selectDocumentDialog } from "./select-document-dialog.mjs";

const { fields } = foundry.data;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Dialog that lets you select something.
 * @param {Record<string, string>} choices - Key/value pairs to select from.
 * @param {object} [options] - Dialog options.
 * @param {string|null} [options.initial=null] - The initially selected choice.
 * @param {string} [options.label="Select"] - Label for the select field.
 * @param {string} [options.hint="Please select an option above."] - Hint text.
 * @param {string} [options.hintHtml=""] - Additional hint with more complex HTML.
 * @param {string} [options.hintTitle=""] - Title for the additional hint.
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
    hintHtml = "",
    hintTitle = "",
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
  if (hintHtml.length > 0) {
    const appendHtmlString = await TextEditor.enrichHTML(hintHtml);
    const appendHtmlElement = document.createElement("div");
    appendHtmlElement.innerHTML = appendHtmlString;
    if (hintTitle.length > 0) {
      const fieldsetElement = document.createElement("fieldset");
      const fieldsetLegend = document.createElement("legend");
      fieldsetLegend.innerText = hintTitle;
      fieldsetElement.append(fieldsetLegend);
      fieldsetElement.append(appendHtmlElement);
      selectContentHtml.append(fieldsetElement);
    } else {
      selectContentHtml.append(appendHtmlElement);
    }
  }

  if (!other) {
    return await TeriockDialog.prompt({
      window: {
        icon: "fa-solid fa-circle-check",
        title,
      },
      modal: true,
      content: selectContentHtml,
      ok: {
        callback: (_event, button) =>
          button.form.elements.namedItem("selected").value,
      },
    });
  }

  const otherContentHtml = document.createElement("div");
  const otherField = new fields.StringField({
    label,
    hint,
  });
  otherContentHtml.append(
    otherField.toFormGroup({ units: "other" }, { name: "other" }),
  );

  return await TeriockDialog.prompt({
    window: {
      icon: "fa-solid fa-circle-check",
      title,
    },
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
          if (genericOther) {
            return null;
          }

          return await TeriockDialog.prompt({
            window: {
              icon: "fa-solid fa-circle-check",
              title,
            },
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
  return await selectDialog(TERIOCK.index.equipmentClasses, {
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
  return await selectDialog(TERIOCK.index.weaponClasses, {
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
  return await selectDialog(TERIOCK.index.conditions, {
    label: "Condition",
    hint: "Please select a condition.",
    title: "Select Condition",
  });
}

/**
 * Select property dialog.
 * @returns {Promise<Teriock.Parameters.Equipment.PropertyKey|null>}
 */
export async function selectPropertyDialog() {
  let choices;
  if (game.settings.get("teriock", "quickIndexProperties")) {
    choices = game.teriock.packs.properties().index.contents;
  } else {
    choices = await Promise.all(
      Object.values(TERIOCK.index.properties).map((name) => getProperty(name)),
    );
  }
  const chosen = await selectDocumentDialog(choices, {
    hint: "Please select a property.",
    title: "Select Property",
  });
  if (chosen) {
    return toCamelCase(chosen.name);
  } else {
    return null;
  }
}

/**
 * Select tradecraft dialog.
 * @returns {Promise<Teriock.Parameters.Fluency.Tradecraft|null>}
 */
export async function selectTradecraftDialog() {
  const choices = await Promise.all(
    Object.keys(TERIOCK.index.tradecrafts).map(async (tc) => {
      return {
        name: TERIOCK.index.tradecrafts[tc],
        uuid: tc,
        img: getIcon("tradecrafts", TERIOCK.index.tradecrafts[tc]),
        tooltip: await TeriockTextEditor.makeTooltip(await tradecraftPanel(tc)),
      };
    }),
  );
  const chosen = await selectDocumentDialog(choices, {
    hint: "Please select a tradecraft.",
    title: "Select Tradecraft",
    tooltipKey: "tooltip",
  });
  if (chosen) {
    return chosen.uuid;
  } else {
    return null;
  }
}

/**
 * Select ability dialog.
 * @returns {Promise<string|null>}
 */
export async function selectAbilityDialog() {
  let choices;
  if (game.settings.get("teriock", "quickIndexAbilities")) {
    choices = game.teriock.packs.abilities().index.contents;
  } else {
    choices = await Promise.all(
      Object.values(TERIOCK.index.abilities).map((name) => getAbility(name)),
    );
  }
  const chosen = await selectDocumentDialog(choices, {
    hint: "Please select an ability.",
    title: "Select Ability",
  });
  if (chosen) {
    return toCamelCase(chosen.name);
  } else {
    return null;
  }
}

/**
 * Select equipment dialog.
 * @returns {Promise<string|null>}
 */
export async function selectEquipmentTypeDialog() {
  let choices;
  if (game.settings.get("teriock", "quickIndexEquipment")) {
    const equipmentPack = game.teriock.packs.equipment();
    choices = equipmentPack.index.contents;
  } else {
    choices = await Promise.all(
      Object.values(TERIOCK.index.equipment).map((name) =>
        getItem(name, "equipment"),
      ),
    );
  }
  let chosen = await selectDocumentDialog(choices, {
    hint: "Please select an equipment type",
    title: "Select Equipment Type",
  });
  if (chosen) {
    chosen = await foundry.utils.fromUuid(chosen.uuid);
    return toCamelCase(chosen.system.equipmentType);
  } else {
    return null;
  }
}

/**
 * Select class dialog.
 * @returns {Promise<string|null>}
 */
export async function selectClassDialog() {
  const choices = await Promise.all(
    [
      ...Object.keys(TERIOCK.options.rank.mage.classes),
      ...Object.keys(TERIOCK.options.rank.semi.classes),
      ...Object.keys(TERIOCK.options.rank.warrior.classes),
    ].map(async (c) => {
      return {
        name: TERIOCK.index.classes[c],
        uuid: c,
        img: getIcon("classes", TERIOCK.index.classes[c]),
        tooltip: await TeriockTextEditor.makeTooltip(await classPanel(c)),
      };
    }),
  );
  const chosen = await selectDocumentDialog(choices, {
    hint: "Please select a class.",
    title: "Select Class",
    tooltipKey: "tooltip",
  });
  if (chosen) {
    return chosen.uuid;
  } else {
    return null;
  }
}
