import { DocumentSelector } from "../../../applications/dialogs/_module.mjs";
import effectConfig from "../../../constants/config/effect-config.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { TeriockActiveEffect, TeriockItem } from "../../../documents/_module.mjs";
import { resolveDocument } from "../../../helpers/resolve.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @typedef DocumentConstruction
 * @property {UUID<AnyChildDocument>} uuid
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
 * @property {FamilyConstruction} primary
 * @property {FamilyConstruction} secondary
 * @property {Teriock.Keys.ApplicationTarget} target
 */
export default class AddDocumentsActivation extends BaseActivation {
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
    return Object.assign(super.defineSchema(), {
      primary: familyConstructionField(),
      secondary: familyConstructionField(),
      target: new fields.StringField({
        choices: objectMap(effectConfig.applicationTargets, e => e.label, { localize: true }),
        initial: "actor",
      }),
    });
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
    const familyConstruction = this.event?.altKey ? this.secondary : this.primary;
    const family = await this.constructFamily(familyConstruction);
    await Promise.all(this.actors.map(async a => {
      if (this.target === "actor") {
        await this.createFamily(a, family);
        ui.notifications.success("TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.added", {
          format: { name: a.name },
          localize: true,
        });
      } else {
        let choices = [];
        if (this.target === "armament") { choices = a.armaments; }
        if (this.target === "item") { choices = a.visibleChildren.filter(c => c.documentName === "Item"); }
        const chosen = await DocumentSelector.selectMulti(choices);
        await Promise.all(chosen.map(c => {
          this.createFamily(c, family);
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
   * @param {AnyCommonDocument} parent
   * @param {object[]} docs
   * @returns {Promise<AnyChildDocument[]>}
   */
  async safeCreate(parent, docs) {
    const effectData = docs.filter(d => TeriockActiveEffect.TYPES.includes(d?.type));
    const itemData = docs.filter(d => TeriockItem.TYPES.includes(d?.type));
    const promises = [];
    if (effectData.length > 0) { promises.push(parent.createChildDocuments("ActiveEffect", effectData)); }
    if (itemData.length > 0) { promises.push(parent.createChildDocuments("Item", itemData)); }
    const allChildren = await Promise.all(promises);
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
        const promises = [];
        if (effectsToDelete.length > 0) {
          promises.push(a.deleteChildDocuments("ActiveEffect", Array.from(new Set(effectsToDelete.map(e => e.id)))));
        }
        if (itemsToDelete.length > 0) {
          promises.push(a.deleteChildDocuments("Item", Array.from(new Set(itemsToDelete.map(i => i.id)))));
        }
        await Promise.all(promises);
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
