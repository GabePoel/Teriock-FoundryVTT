import { icons } from "../../constants/display/icons.mjs";
import { classPanel, tradecraftPanel } from "../../helpers/panel.mjs";
import { getImage } from "../../helpers/path.mjs";
import { resolveDocument } from "../../helpers/resolve.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";
import { selectDocumentDialog, selectDocumentsDialog } from "./select-document-dialog.mjs";

const { fields } = foundry.data;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Dialog that lets you select something.
 * @param {Record<string, string>} choices - Key/value pairs to select from.
 * @param {object} [options] - Dialog options.
 * @param {string|null} [options.initial=null] - The initially selected choice.
 * @param {boolean} [options.genericOther=true] - If true, "Other" returns `null` instead of prompting again.
 * @param {boolean} [options.other=false] - Whether to include an "Other" button.
 * @param {boolean} [options.required=false] - If true, no blank choice will be offered.
 * @param {string} [options.hint="Please select an option above."] - Hint text.
 * @param {string} [options.hintHtml=""] - Additional hint with more complex HTML.
 * @param {string} [options.hintTitle=""] - Title for the additional hint.
 * @param {string} [options.icon] - Icon to use for the select window.
 * @param {string} [options.label="Select"] - Label for the select field.
 * @param {string} [options.title="Select"] - Dialog title.
 * @returns {Promise<string|null>} The chosen value, or `null` if canceled or genericOther.
 */
export async function selectDialog(choices, options = {}) {
  const {
    genericOther = true,
    hint = _loc("TERIOCK.DIALOGS.Select.defaults.hint"),
    hintHtml = "",
    hintTitle = "",
    icon = makeIconClass(icons.ui.select, "title"),
    initial = null,
    label = _loc("TERIOCK.DIALOGS.Select.defaults.label"),
    other = false,
    required = false,
    title = _loc("TERIOCK.DIALOGS.Select.defaults.title"),
  } = options;

  const selectContentHtml = document.createElement("div");
  const selectField = new fields.StringField({ choices, hint, initial, label, required });
  selectContentHtml.append(selectField.toFormGroup({ rootId: foundry.utils.randomID() }, { name: "selected" }));
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
      content: selectContentHtml,
      modal: true,
      ok: { callback: (_event, button) => button.form.elements.namedItem("selected").value },
      window: { icon: makeIconClass(icon, "title"), title },
    });
  }

  const otherContentHtml = document.createElement("div");
  const otherField = new fields.StringField({ hint, label });
  otherContentHtml.append(
    otherField.toFormGroup({ rootId: foundry.utils.randomID(), units: "other" }, { name: "other" }),
  );

  return await TeriockDialog.prompt({
    buttons: [{
      action: "other",
      label: _loc("TERIOCK.DIALOGS.Select.otherButton"),
      callback: async (_event, _button, dialog) => {
        dialog.classList.add("force-hidden");
        if (genericOther) return null;

        return await TeriockDialog.prompt({
          content: otherContentHtml,
          modal: true,
          ok: { callback: (_event, button) => button.form.elements.namedItem("other").value },
          window: { icon: makeIconClass(TERIOCK.display.icons.ui.custom, "title"), title },
        });
      },
    }],
    content: selectContentHtml,
    modal: true,
    ok: { default: true, callback: (_event, button) => button.form.elements.namedItem("selected").value },
    window: { icon: makeIconClass(TERIOCK.display.icons.ui.select, "title"), title },
  });
}

/**
 * Dialog to select an equipment class.
 * @returns {Promise<Teriock.Keys.EquipmentClass>}
 */
export async function selectEquipmentClassDialog() {
  return await selectDialog(TERIOCK.reference.equipmentClasses, {
    hint: _loc("TERIOCK.DIALOGS.Select.EquipmentClass.hint"),
    label: _loc("TERIOCK.DIALOGS.Select.EquipmentClass.label"),
    title: _loc("TERIOCK.DIALOGS.Select.EquipmentClass.title"),
  });
}

/**
 * Dialog to select a weapon class.
 * @returns {Promise<Teriock.Keys.WeaponClass>}
 */
export async function selectWeaponClassDialog() {
  return await selectDialog(TERIOCK.reference.weaponClasses, {
    hint: _loc("TERIOCK.DIALOGS.Select.WeaponClass.hint"),
    label: _loc("TERIOCK.DIALOGS.Select.WeaponClass.label"),
    title: _loc("TERIOCK.DIALOGS.Select.WeaponClass.title"),
  });
}

/**
 * Dialog to select a condition.
 * @returns {Promise<Teriock.Keys.Condition>}
 */
export async function selectConditionDialog() {
  return await selectDialog(TERIOCK.reference.conditions, {
    hint: _loc("TERIOCK.DIALOGS.Select.Condition.hint"),
    label: _loc("TERIOCK.DIALOGS.Select.Condition.label"),
    title: _loc("TERIOCK.DIALOGS.Select.Condition.title"),
  });
}

/**
 * Dialog to select a property.
 * @returns {Promise<TeriockProperty|void>}
 */
export async function selectPropertyDialog() {
  return await resolveDocument(
    await selectDocumentDialog(await noSup(game.teriock.packs.properties), {
      hint: _loc("TERIOCK.DIALOGS.Select.Property.hint"),
      openable: true,
      title: _loc("TERIOCK.DIALOGS.Select.Property.title"),
      tooltipAsync: true,
    }),
  );
}

/**
 * Internal helper to build tradecraft dialog choices.
 * @param {Teriock.Keys.Tradecraft[]} [tradecrafts]
 * @returns {Promise<Index<TeriockDocument>[]>}
 */
async function _tradecraftChoices(tradecrafts) {
  const tradecraftList = tradecrafts?.length ? tradecrafts : Object.keys(TERIOCK.reference.tradecrafts);
  if (tradecraftList.length === 0) return [];
  return Promise.all(tradecraftList.map(async tc => {
    return {
      img: getImage("tradecrafts", TERIOCK.index.tradecrafts[tc]),
      name: TERIOCK.reference.tradecrafts[tc],
      tooltip: await TeriockTextEditor.makeTooltip(await tradecraftPanel(tc)),
      uuid: tc,
    };
  }));
}

/**
 * Dialog to select a tradecraft.
 * @param {Teriock.Keys.Tradecraft[]} [tradecrafts]
 * @returns {Promise<Teriock.Keys.Tradecraft|null>}
 */
export async function selectTradecraftDialog(tradecrafts) {
  const chosen = await selectTradecraftsDialog(tradecrafts, { multi: false });
  return chosen?.[0] ?? null;
}

/**
 * Dialog to select one or more tradecrafts.
 * @param {Teriock.Keys.Tradecraft[]} [tradecrafts]
 * @param {object} [options]
 * @param {boolean} [options.multi=true]
 * @returns {Promise<Teriock.Keys.Tradecraft[]>}
 */
export async function selectTradecraftsDialog(tradecrafts, { multi = true } = {}) {
  const choices = await _tradecraftChoices(tradecrafts);
  if (choices.length === 0) return [];
  const chosen = await selectDocumentsDialog(choices, {
    hint: _loc("TERIOCK.DIALOGS.Select.Tradecraft.hint"),
    multi,
    openable: true,
    title: _loc("TERIOCK.DIALOGS.Select.Tradecraft.title"),
    tooltipKey: "tooltip",
  });
  if (!chosen) return [];
  return chosen.map(c => c.uuid);
}

/**
 * Dialog to select an ability.
 * @returns {Promise<TeriockAbility|void>}
 */
export async function selectAbilityDialog() {
  return await resolveDocument(
    await selectDocumentDialog(await noSup(game.teriock.packs.abilities), {
      hint: _loc("TERIOCK.DIALOGS.Select.Ability.hint"),
      openable: true,
      title: _loc("TERIOCK.DIALOGS.Select.Ability.title"),
      tooltipAsync: true,
    }),
  );
}

/**
 * Dialog to select compendiums.
 * @property {boolean} selected
 * @returns {Promise<CompendiumCollection<TeriockDocument>[]>}
 */
export async function selectCompendiumsDialog(selected = true) {
  const packDocs = game.packs.contents.filter(p => !p.locked).map(p => {
    return { img: p.banner || "icons/svg/book.svg", name: _loc(p.title), uuid: p.collection };
  });
  packDocs.sort((a, b) => a.name.localeCompare(b.name));
  const chosen = await tm.dialogs.selectDocumentsDialog(packDocs, {
    checked: packDocs.map(p => p.uuid && selected),
    hint: _loc("TERIOCK.DIALOGS.Select.Compendiums.hint"),
    title: _loc("TERIOCK.DIALOGS.Select.Compendiums.title"),
    tooltip: false,
    tooltipAsync: false,
  });
  return chosen.map(c => game.packs.get(c.uuid));
}

/**
 * Dialog to select equipment.
 * @returns {Promise<TeriockEquipment|void>}
 */
export async function selectEquipmentTypeDialog() {
  return resolveDocument(
    await selectDocumentDialog(await noSup(game.teriock.packs.equipment), {
      hint: _loc("TERIOCK.DIALOGS.Select.EquipmentType.hint"),
      openable: true,
      title: _loc("TERIOCK.DIALOGS.Select.EquipmentType.title"),
      tooltipAsync: true,
    }),
  );
}

/**
 * Dialog to select a species.
 * @returns {Promise<TeriockSpecies|void>}
 */
export async function selectSpeciesDialog() {
  return resolveDocument(
    await selectDocumentDialog(await noSup(game.teriock.packs.species), {
      hint: _loc("TERIOCK.DIALOGS.Select.Species.hint"),
      openable: true,
      title: _loc("TERIOCK.DIALOGS.Select.Species.title"),
      tooltipAsync: true,
    }),
  );
}

/**
 * Dialog to select a body part.
 * @returns {Promise<TeriockBody|void>}
 */
export async function selectBodyPartDialog() {
  return resolveDocument(
    await selectDocumentDialog(await noSup(game.teriock.packs.bodyParts), {
      hint: _loc("TERIOCK.DIALOGS.Select.BodyPart.hint"),
      openable: true,
      title: _loc("TERIOCK.DIALOGS.Select.BodyPart.title"),
      tooltipAsync: true,
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
      ...Object.keys(TERIOCK.config.rank.mage.classes),
      ...Object.keys(TERIOCK.config.rank.semi.classes),
      ...Object.keys(TERIOCK.config.rank.warrior.classes),
    ].map(async c => {
      return {
        img: getImage("classes", TERIOCK.index.classes[c]),
        name: TERIOCK.reference.classes[c],
        tooltip: await TeriockTextEditor.makeTooltip(await classPanel(c)),
        uuid: c,
      };
    }),
  );
  const chosen = await selectDocumentDialog(choices, {
    hint: _loc("TERIOCK.DIALOGS.Select.Class.hint"),
    title: _loc("TERIOCK.DIALOGS.Select.Class.title"),
    tooltipKey: "tooltip",
  });
  if (chosen) return chosen.uuid;
  else return null;
}

/**
 * @param {CompendiumCollection<AnyItem>} pack
 */
async function noSup(pack) {
  if (!pack.indexed) {
    ui.notifications.info("TERIOCK.DIALOGS.NewDocument.loading", {
      format: { name: _loc(pack.title) },
      localize: true,
    });
  }
  const index = await pack.getIndex({ fields: "system._sup" });
  return index.contents.filter(i => !i.system._sup);
}
