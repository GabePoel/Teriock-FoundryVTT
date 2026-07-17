import { resolveDocument } from "../../helpers/resolve.mjs";
import ChoiceSelector from "./choice-selector.mjs";
import DocumentSelector from "./document-selector.mjs";

/**
 * Dialog to select an equipment class.
 * @returns {Promise<Teriock.Keys.EquipmentClass>}
 */
export async function selectEquipmentClassDialog() {
  return ChoiceSelector.prompt(TERIOCK.reference.equipmentClasses, {
    hint: _loc("TERIOCK.DIALOGS.Select.EquipmentClass.hint"),
    label: _loc("TERIOCK.DIALOGS.Select.EquipmentClass.label"),
    title: _loc("TERIOCK.DIALOGS.Select.EquipmentClass.title"),
  });
}

/**
 * Dialog to select a condition.
 * @returns {Promise<Teriock.Keys.Condition>}
 */
export async function selectConditionDialog() {
  return ChoiceSelector.prompt(TERIOCK.reference.conditions, {
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
  return resolveDocument(
    await DocumentSelector.selectSingle(await noSup(game.packs.get("teriock.properties")), {
      hint: _loc("TERIOCK.DIALOGS.Select.Property.hint"),
      openable: true,
      title: _loc("TERIOCK.DIALOGS.Select.Property.title"),
    }),
  );
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
  const tradecraftJournal = await resolveDocument(game.packs.get("teriock.rules").getName("Tradecraft"));
  let choices = tradecraftJournal?.pages.contents;
  if (tradecrafts) { choices = choices.filter(t => tradecrafts.includes(t.system.identifier)); }
  if (choices.length === 0) { return []; }
  const chosen = await DocumentSelector.selectMulti(choices, {
    hint: _loc("TERIOCK.DIALOGS.Select.Tradecraft.hint"),
    multi,
    openable: true,
    title: _loc("TERIOCK.DIALOGS.Select.Tradecraft.title"),
  });
  if (!chosen) { return []; }
  return chosen.map(c => c.system.identifier);
}

/**
 * Dialog to select an ability.
 * @returns {Promise<TeriockAbility|void>}
 */
export async function selectAbilityDialog() {
  return resolveDocument(
    await DocumentSelector.selectSingle(await noSup(game.packs.get("teriock.abilities")), {
      hint: _loc("TERIOCK.DIALOGS.Select.Ability.hint"),
      openable: true,
      title: _loc("TERIOCK.DIALOGS.Select.Ability.title"),
    }),
  );
}

/**
 * Dialog to select compendiums.
 * @param {boolean} [selected=true]
 * @returns {Promise<CompendiumCollection<TeriockDocument>[]>}
 */
export async function selectCompendiumsDialog(selected = true) {
  const packDocs = game.packs.contents.filter(p => !p.locked).map(p => {
    return { img: p.banner || "icons/svg/book.svg", name: _loc(p.title), uuid: p.collection };
  });
  packDocs.sort((a, b) => a.name.localeCompare(b.name));
  const chosen = await DocumentSelector.selectMulti(packDocs, {
    checked: packDocs.map(p => p.uuid && selected),
    hint: _loc("TERIOCK.DIALOGS.Select.Compendiums.hint"),
    title: _loc("TERIOCK.DIALOGS.Select.Compendiums.title"),
    tooltip: false,
  });
  return chosen.map(c => game.packs.get(c.uuid));
}

/**
 * Dialog to select equipment.
 * @returns {Promise<TeriockEquipment|void>}
 */
export async function selectEquipmentTypeDialog() {
  return resolveDocument(
    await DocumentSelector.selectSingle(await noSup(game.packs.get("teriock.equipment")), {
      hint: _loc("TERIOCK.DIALOGS.Select.EquipmentType.hint"),
      openable: true,
      title: _loc("TERIOCK.DIALOGS.Select.EquipmentType.title"),
    }),
  );
}

/**
 * Dialog to select a species.
 * @returns {Promise<TeriockSpecies|void>}
 */
export async function selectSpeciesDialog() {
  return resolveDocument(
    await DocumentSelector.selectSingle(await noSup(game.packs.get("teriock.species")), {
      hint: _loc("TERIOCK.DIALOGS.Select.Species.hint"),
      openable: true,
      title: _loc("TERIOCK.DIALOGS.Select.Species.title"),
    }),
  );
}

/**
 * Dialog to select a body part.
 * @returns {Promise<TeriockBody|void>}
 */
export async function selectBodyPartDialog() {
  return resolveDocument(
    await DocumentSelector.selectSingle(await noSup(game.packs.get("teriock.bodyParts")), {
      hint: _loc("TERIOCK.DIALOGS.Select.BodyPart.hint"),
      openable: true,
      title: _loc("TERIOCK.DIALOGS.Select.BodyPart.title"),
    }),
  );
}

/**
 * Dialog to select a class.
 * @param {Teriock.Keys.Class[]} [classes]
 * @returns {Promise<Teriock.Keys.Class|null>}
 */
export async function selectClassDialog(classes = null) {
  const classJournal = await resolveDocument(game.packs.get("teriock.rules").getName("Class"));
  let choices = classJournal?.pages.contents;
  if (classes) { choices = choices.filter(c => classes.includes(c.system.identifier)); }
  choices = choices.filter((c) => c.system.archetype !== "archetype:everyman");
  if (choices.length === 0) { return null; }
  const chosen = await DocumentSelector.selectSingle(choices, {
    hint: _loc("TERIOCK.DIALOGS.Select.Class.hint"),
    openable: true,
    title: _loc("TERIOCK.DIALOGS.Select.Class.title"),
  });
  if (chosen) { return chosen.system.identifier; }
  return null;
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
  const index = await pack.getIndex();
  return index.contents.filter(i => !i.system._sup);
}
