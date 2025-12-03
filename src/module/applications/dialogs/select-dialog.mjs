//noinspection JSUnusedGlobalSymbols

import { classPanel, tradecraftPanel } from "../../helpers/html.mjs";
import { getImage } from "../../helpers/path.mjs";
import { makeIconClass, resolveDocument } from "../../helpers/utils.mjs";
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
  selectContentHtml.append(
    selectField.toFormGroup(
      { rootId: foundry.utils.randomID() },
      { name: "selected" },
    ),
  );
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
        icon: makeIconClass("circle-question", "title"),
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
    otherField.toFormGroup(
      { rootId: foundry.utils.randomID(), units: "other" },
      { name: "other" },
    ),
  );

  return await TeriockDialog.prompt({
    window: {
      icon: makeIconClass("circle-question", "title"),
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
              icon: makeIconClass("circle-question", "title"),
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
 * Dialog to select an equipment class.
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
 * Dialog to select a weapon class.
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
 * Dialog to select a condition.
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
 * Dialog to select a property.
 * @returns {Promise<TeriockProperty|void>}
 */
export async function selectPropertyDialog() {
  return (
    await resolveDocument(
      await selectDocumentDialog(game.teriock.packs.properties.index.contents, {
        hint: "Please select an property.",
        title: "Select Property",
        tooltipAsync: true,
        openable: true,
      }),
    )
  ).system.effect;
}

/**
 * Dialog to select a tradecraft.
 * @returns {Promise<Teriock.Parameters.Fluency.Tradecraft|null>}
 */
export async function selectTradecraftDialog() {
  const choices = await Promise.all(
    Object.keys(TERIOCK.index.tradecrafts).map(async (tc) => {
      return {
        name: TERIOCK.index.tradecrafts[tc],
        uuid: tc,
        img: getImage("tradecrafts", TERIOCK.index.tradecrafts[tc]),
        tooltip: await TeriockTextEditor.makeTooltip(await tradecraftPanel(tc)),
      };
    }),
  );
  const chosen = await selectDocumentDialog(choices, {
    hint: "Please select a tradecraft.",
    title: "Select Tradecraft",
    tooltipKey: "tooltip",
    openable: true,
  });
  if (chosen) {
    return chosen.uuid;
  } else {
    return null;
  }
}

/**
 * Dialog to select an ability.
 * @returns {Promise<TeriockAbility|void>}
 */
export async function selectAbilityDialog() {
  return (
    await resolveDocument(
      await selectDocumentDialog(game.teriock.packs.abilities.index.contents, {
        hint: "Please select an ability.",
        title: "Select Ability",
        tooltipAsync: true,
        openable: true,
      }),
    )
  ).system.effect;
}

/**
 * Dialog to select a equipment.
 * @returns {Promise<TeriockEquipment|void>}
 */
export async function selectEquipmentTypeDialog() {
  return resolveDocument(
    await selectDocumentDialog(game.teriock.packs.equipment.index.contents, {
      hint: "Please select an equipment type.",
      title: "Select Equipment Type",
      tooltipAsync: true,
      openable: true,
    }),
  );
}

/**
 * Dialog to select a body part.
 * @returns {Promise<TeriockBody|void>}
 */
export async function selectBodyPartDialog() {
  return resolveDocument(
    await selectDocumentDialog(game.teriock.packs.bodyParts.index.contents, {
      hint: "Please select a body part.",
      title: "Select Body Part",
      tooltipAsync: true,
      openable: true,
    }),
  );
}

/**
 * Dialog to select a class.
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
        img: getImage("classes", TERIOCK.index.classes[c]),
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
