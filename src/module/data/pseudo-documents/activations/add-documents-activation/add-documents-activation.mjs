import { DocumentSelector } from "../../../../applications/dialogs/_module.mjs";
import effectConfig from "../../../../constants/config/effect-config.mjs";
import { icons } from "../../../../constants/display/icons.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { resolveDocument } from "../../../../helpers/resolve.mjs";
import { objectMap, omit } from "../../../../helpers/utils.mjs";
import { SelectionPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseActivation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @import { SchemaField } from "@common/data/fields.mjs";
 */

/**
 * @typedef DocumentConstruction
 * @property {UUID<TeriockActiveEffect|TeriockItem>} uuid
 * @property {object} data
 */

/**
 * @typedef FamilyConstruction
 * @property {DocumentConstruction} root
 * @property {DocumentConstruction[]} children
 * @property {DocumentConstruction[]} grandchildren
 * @property {DocumentConstruction[]} other
 */

/**
 * @typedef ResolvedFamily
 * @property {object} root
 * @property {object[]} children
 * @property {object[]} grandchildren
 * @property {object[]} other
 */

/**
 * @mixes SelectionPseudoDocument
 */
export default class AddDocumentsActivation extends SelectionPseudoDocumentMixin(BaseActivation) {
  /**
   * Whether a family construction has any documents to create.
   * @param {Partial<FamilyConstruction>} famConstruct
   * @returns {boolean}
   */
  static #familyHasContent(famConstruct) {
    return Boolean(
      famConstruct?.root?.uuid
        || !foundry.utils.isEmpty(famConstruct?.root?.data ?? {})
        || famConstruct?.other?.length > 0,
    );
  }

  /** @inheritDoc */
  static get ICON() {
    return icons.ui.apply;
  }

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.COMMANDS.ApplyEffect.label";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "addDocuments";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(
      omit(super.defineSchema(), ["expandFolders", "expandTables", "makeSeparateActivations", "selectInExecution"]),
      {
        primary: familyConstructionField(),
        secondary: familyConstructionField(),
        target: new fields.StringField({
          blank: false,
          choices: objectMap(effectConfig.applicationTargets, e => e.label, { localize: true }),
          initial: "actor",
          nullable: false,
          required: true,
        }),
      },
    );
  }

  /**
   * The families to create, one per selected document when a selection is configured.
   * @returns {Promise<Partial<ResolvedFamily>[]>}
   */
  async #chooseFamilies() {
    const construction = await this.chooseFamily();
    if (!construction) { return []; }
    if (!this.hasSelection) { return [await this.constructFamily(construction)]; }
    const documents = await this.selectDocuments();
    return Promise.all(documents.map(d => {
      const data = foundry.utils.deepClone(construction.root?.data ?? {});
      if (data.name) { data.name = BaseRoll.replaceFormulaData(data.name, { base: d.name }); }
      return this.constructFamily({ ...construction, root: { data, uuid: d.uuid } });
    }));
  }

  /**
   * Selection entry representing a constructed document family.
   * @param {"primary"|"secondary"} key
   * @param {Partial<ResolvedFamily>} fam
   * @returns {{ uuid: string, name: string, img: string, text: string }}
   */
  #familyEntry(key, fam) {
    const representative = fam.root ?? fam.other?.[0] ?? {};
    const documentName = ActiveEffect.implementation.TYPES.includes(representative?.type) ? "ActiveEffect" : "Item";
    const Cls = foundry.utils.getDocumentClass(documentName);
    const doc = new Cls(representative);
    return {
      img: doc.img,
      name: doc.fullName ?? doc.name ?? _loc(`TERIOCK.ACTIVATIONS.AddDocuments.DIALOG.${key}`),
      text: _loc(`TERIOCK.ACTIVATIONS.AddDocuments.DIALOG.${key}`),
      uuid: key,
    };
  }

  /** @inheritDoc */
  get _selectionRelativeTo() {
    return this.document?.speakerActor ?? null;
  }

  /** @inheritDoc */
  get _selectionTitle() {
    return this.label;
  }

  /**
   * Choose between the document families.
   * @returns {Promise<Partial<FamilyConstruction>|null>} The chosen family, or `null` if canceled.
   */
  async chooseFamily() {
    const useSecondary = Boolean(this.event?.altKey);
    if (
      !AddDocumentsActivation.#familyHasContent(this.secondary)
      || foundry.utils.equals(this.primary, this.secondary)
      || !game.settings.get("teriock", "selectAddedDocuments")
    ) {
      return useSecondary ? this.secondary : this.primary;
    }
    const entries = await Promise.all(
      ["primary", "secondary"].map(async key => this.#familyEntry(key, await this.constructFamily(this[key]))),
    );
    const chosen = await DocumentSelector.selectSingle(entries, {
      checked: useSecondary ? "secondary" : "primary",
      hint: "TERIOCK.ACTIVATIONS.AddDocuments.DIALOG.hint",
      textKey: "text",
      title: "TERIOCK.ACTIVATIONS.AddDocuments.DIALOG.title",
      tooltip: false,
    });
    return chosen ? this[chosen.uuid] : null;
  }

  /**
   * Construct a document.
   * @param {Partial<DocumentConstruction>} docConstruct
   * @returns {object}
   */
  async constructDocument(docConstruct) {
    const data = {};
    if (docConstruct.uuid) {
      const doc = await resolveDocument(docConstruct.uuid);
      if (doc) { Object.assign(data, doc.toObject(true)); }
    }
    if (docConstruct.data) { foundry.utils.mergeObject(data, docConstruct.data, { inplace: true }); }
    if (!data.origin) { data.origin = this.document?.system._src; }
    foundry.utils.setProperty(data, "flags.teriock.createdBy", this.uuid);
    return data;
  }

  /**
   * Construct a family of documents.
   * @param {Partial<FamilyConstruction>} famConstruct
   * @returns {Promise<Partial<ResolvedFamily>>}
   */
  async constructFamily(famConstruct) {
    const { children = [], grandchildren = [], other = [], root } = famConstruct;
    const queue = [...(root ? [root] : []), ...children, ...grandchildren, ...other];
    const results = await Promise.all(queue.map(doc => this.constructDocument(doc)));
    let pointer = 0;
    const rootData = root ? results[pointer++] : null;
    const childrenData = results.slice(pointer, pointer += children.length);
    for (const child of childrenData) { foundry.utils.deleteProperty(child, "flags.teriock.createdBy"); }
    const grandchildrenData = results.slice(pointer, pointer += grandchildren.length);
    const otherData = results.slice(pointer);
    return { children: childrenData, grandchildren: grandchildrenData, other: otherData, root: rootData };
  }

  /**
   * Create a family of documents on an actor.
   * @param {TeriockActor} actor
   * @param {Partial<ResolvedFamily>} fam
   */
  async createFamily(actor, fam) {
    if (fam.root) {
      const rootDocs = await this.safeCreate(actor, [fam.root]);
      if (rootDocs.length > 0) {
        const root = rootDocs[0];
        if (fam.children && fam.children.length > 0) {
          const children = await this.safeCreate(root, fam.children);
          if (fam.grandchildren && fam.grandchildren.length > 0) {
            await Promise.all(children.map(child => this.safeCreate(child, fam.grandchildren)));
          }
        }
      }
    }
    if (fam.other && fam.other.length > 0) {
      const other = await this.safeCreate(actor, fam.other);
      if (fam.grandchildren && fam.grandchildren.length > 0) {
        await Promise.all(other.map(doc => this.safeCreate(doc, fam.grandchildren)));
      }
    }
  }

  /** @inheritDoc */
  async primaryAction() {
    if (!this.checkActors()) { return; }
    const families = await this.#chooseFamilies();
    if (!families.length) { return; }
    await Promise.all(this.actors.map(async a => {
      if (this.target === "actor") {
        for (const family of families) { await this.createFamily(a, family); }
        ui.notifications.success("TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.added", {
          format: { name: a.name },
          localize: true,
        });
      } else {
        let choices = [];
        if (this.target === "armament") { choices = a.armaments; }
        if (this.target === "item") { choices = a.visibleChildren.filter(c => c.documentName === "Item"); }
        const chosen = await DocumentSelector.selectMulti(choices);
        await Promise.all(chosen.map(async c => {
          for (const family of families) { await this.createFamily(c, family); }
          ui.notifications.success("TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.added", {
            format: { name: c.name },
            localize: true,
          });
        }));
      }
    }));
  }

  /**
   * Safely sort and create valid documents.
   * @param {TeriockActiveEffect|TeriockActor|TeriockItem} parent
   * @param {object[]} docs
   * @returns {Promise<(TeriockActiveEffect|TeriockItem)[]>}
   */
  async safeCreate(parent, docs) {
    // Don't create children if the document creation was rejected.
    if (!parent?.persisted) { return []; }
    const effectData = docs.filter(d => ActiveEffect.implementation.TYPES.includes(d?.type));
    const itemData = docs.filter(d => Item.implementation.TYPES.includes(d?.type));
    const operation = { keepCompetence: true, notifyOnFailure: true };
    const operations = [];
    if (effectData.length > 0) {
      operations.push(parent.getCreateChildDocumentsOperation("ActiveEffect", effectData, operation));
    }
    if (itemData.length > 0) {
      operations.push(parent.getCreateChildDocumentsOperation("Item", itemData, operation));
    }
    const allChildren = await foundry.documents.modifyBatch(operations.filter(Boolean));
    const out = [];
    for (const children of allChildren) { out.push(...children); }
    return out;
  }

  /** @inheritDoc */
  async secondaryAction() {
    if (!this.checkActors()) { return; }
    await Promise.all(this.actors.map(async a => {
      const children = await a.getChildArray();
      if (this.target === "armament") {
        for (const armament of a.armaments) { children.push(...armament.childArray); }
      }
      if (this.target === "item") {
        for (const item of a.items.contents) { children.push(...item.childArray); }
      }
      const toDelete = children.filter(c => c.getFlag("teriock", "createdBy") === this.uuid);
      if (this.target === "armament") { await Promise.all(toDelete.map(d => d.delete())); }
      else {
        const effectsToDelete = toDelete.filter(d => d.documentName === "ActiveEffect");
        const itemsToDelete = toDelete.filter(d => d.documentName === "Item");
        const operations = [];
        if (effectsToDelete.length > 0) {
          const ids = Array.from(new Set(effectsToDelete.map(e => e.id)));
          operations.push(a.getDeleteChildDocumentsOperation("ActiveEffect", ids));
        }
        if (itemsToDelete.length > 0) {
          const ids = Array.from(new Set(itemsToDelete.map(i => i.id)));
          operations.push(a.getDeleteChildDocumentsOperation("Item", ids));
        }
        await foundry.documents.modifyBatch(operations.filter(Boolean));
      }
    }));
    ui.notifications.success("TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.removed", { localize: true });
  }
}

/**
 * Schema field for {@link DocumentConstruction}.
 * @returns {SchemaField}
 */
function documentConstructionField() {
  return new fields.SchemaField({ data: new fields.ObjectField({}), uuid: new fields.DocumentUUIDField() });
}

/**
 * Schema field for {@link FamilyConstruction}.
 * @returns {SchemaField}
 */
function familyConstructionField() {
  return new fields.SchemaField({
    children: new fields.ArrayField(documentConstructionField()),
    grandchildren: new fields.ArrayField(documentConstructionField()),
    other: new fields.ArrayField(documentConstructionField()),
    root: documentConstructionField(),
  });
}
