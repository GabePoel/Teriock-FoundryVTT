//noinspection JSUnusedGlobalSymbols

import { classPanel, tradecraftPanel } from "../../helpers/html.mjs";
import { getImage } from "../../helpers/path.mjs";
import { resolveDocument } from "../../helpers/resolve.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
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
 * @param {string} [options.icon="circle-question"] - Icon to use for the select window.
 * @returns {Promise<string|null>} The chosen value, or `null` if canceled or genericOther.
 */
export async function selectDialog(choices, options = {}) {
  const {
    initial = null,
    label = game.i18n.localize("TERIOCK.DIALOGS.Select.defaults.label"),
    hint = game.i18n.localize("TERIOCK.DIALOGS.Select.defaults.hint"),
    hintHtml = "",
    hintTitle = "",
    title = game.i18n.localize("TERIOCK.DIALOGS.Select.defaults.title"),
    other = false,
    genericOther = true,
    icon = "circle-question",
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
        icon: makeIconClass(icon, "title"),
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
        label: game.i18n.localize("TERIOCK.DIALOGS.Select.otherButton"),
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
  return await selectDialog(TERIOCK.reference.equipmentClasses, {
    label: game.i18n.localize("TERIOCK.DIALOGS.Select.EquipmentClass.label"),
    hint: game.i18n.localize("TERIOCK.DIALOGS.Select.EquipmentClass.hint"),
    title: game.i18n.localize("TERIOCK.DIALOGS.Select.EquipmentClass.title"),
  });
}

/**
 * Dialog to select a weapon class.
 * @returns {Promise<Teriock.Parameters.Equipment.WeaponClass>}
 */
export async function selectWeaponClassDialog() {
  return await selectDialog(TERIOCK.reference.weaponClasses, {
    label: game.i18n.localize("TERIOCK.DIALOGS.Select.WeaponClass.label"),
    hint: game.i18n.localize("TERIOCK.DIALOGS.Select.WeaponClass.hint"),
    title: game.i18n.localize("TERIOCK.DIALOGS.Select.WeaponClass.title"),
  });
}

/**
 * Dialog to select a condition.
 * @returns {Promise<Teriock.Parameters.Condition.ConditionKey>}
 */
export async function selectConditionDialog() {
  return await selectDialog(TERIOCK.reference.conditions, {
    label: game.i18n.localize("TERIOCK.DIALOGS.Select.Condition.label"),
    hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Condition.hint"),
    title: game.i18n.localize("TERIOCK.DIALOGS.Select.Condition.title"),
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
        hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Property.hint"),
        title: game.i18n.localize("TERIOCK.DIALOGS.Select.Property.title"),
        tooltipAsync: true,
        openable: true,
      }),
    )
  )?.system.effect;
}

/**
 * Dialog to select a tradecraft.
 * @returns {Promise<Teriock.Parameters.Fluency.Tradecraft|null>}
 */
export async function selectTradecraftDialog() {
  const choices = await Promise.all(
    Object.keys(TERIOCK.reference.tradecrafts).map(async (tc) => {
      return {
        name: TERIOCK.reference.tradecrafts[tc],
        uuid: tc,
        img: getImage("tradecrafts", TERIOCK.index.tradecrafts[tc]),
        tooltip: await TeriockTextEditor.makeTooltip(await tradecraftPanel(tc)),
      };
    }),
  );
  const chosen = await selectDocumentDialog(choices, {
    hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Tradecraft.hint"),
    title: game.i18n.localize("TERIOCK.DIALOGS.Select.Tradecraft.title"),
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
        hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Ability.hint"),
        title: game.i18n.localize("TERIOCK.DIALOGS.Select.Ability.title"),
        tooltipAsync: true,
        openable: true,
      }),
    )
  )?.system.effect;
}

/**
 * Dialog to select compendiums.
 * @property {boolean} selected
 * @returns {Promise<TeriockCompendiumCollection<TeriockDocument>[]>}
 */
export async function selectCompendiumsDialog(selected = true) {
  const packDocs = game.packs.contents
    .filter((p) => !p.locked)
    .map((p) => {
      return {
        name: game.i18n.localize(p.title),
        uuid: p.collection,
        img: p.banner || "icons/svg/book.svg",
      };
    });
  packDocs.sort((a, b) => a.name.localeCompare(b.name));
  const chosen = await tm.dialogs.selectDocumentsDialog(packDocs, {
    tooltip: false,
    tooltipAsync: false,
    hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Compendiums.hint"),
    title: game.i18n.localize("TERIOCK.DIALOGS.Select.Compendiums.title"),
    checked: packDocs.map((p) => p.uuid && selected),
  });
  return chosen.map((c) => game.packs.get(c.uuid));
}

/**
 * Dialog to select equipment.
 * @returns {Promise<TeriockEquipment|void>}
 */
export async function selectEquipmentTypeDialog() {
  return resolveDocument(
    await selectDocumentDialog(game.teriock.packs.equipment.index.contents, {
      hint: game.i18n.localize("TERIOCK.DIALOGS.Select.EquipmentType.hint"),
      title: game.i18n.localize("TERIOCK.DIALOGS.Select.EquipmentType.title"),
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
      hint: game.i18n.localize("TERIOCK.DIALOGS.Select.BodyPart.hint"),
      title: game.i18n.localize("TERIOCK.DIALOGS.Select.BodyPart.title"),
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
        name: TERIOCK.reference.classes[c],
        uuid: c,
        img: getImage("classes", TERIOCK.index.classes[c]),
        tooltip: await TeriockTextEditor.makeTooltip(await classPanel(c)),
      };
    }),
  );
  const chosen = await selectDocumentDialog(choices, {
    hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Class.hint"),
    title: game.i18n.localize("TERIOCK.DIALOGS.Select.Class.title"),
    tooltipKey: "tooltip",
  });
  if (chosen) {
    return chosen.uuid;
  } else {
    return null;
  }
}
