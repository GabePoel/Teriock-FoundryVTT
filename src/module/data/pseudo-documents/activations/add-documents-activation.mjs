import { icons } from "../../../constants/display/icons.mjs";
import { documentOptions } from "../../../constants/options/document-options.mjs";
import { resolveDocument } from "../../../helpers/resolve.mjs";
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
 * @property {DocumentConstruction[]} other
 */

/**
 * @typedef ResolvedFamily
 * @property {object} root
 * @property {object[]} children
 * @property {object[]} other
 */

/**
 * @property {FamilyConstruction} primary
 * @property {FamilyConstruction} secondary
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
    });
  }

  /**
   * Construct a document.
   * @param {Partial<DocumentConstruction>} docConstruct
   * @returns {object}
   */
  async constructDocument(docConstruct) {
    let data = {};
    if (docConstruct.uuid) {
      const doc = await resolveDocument(docConstruct.uuid);
      if (doc) Object.assign(data, doc.toObject());
    }
    if (docConstruct.data) {
      foundry.utils.mergeObject(data, docConstruct.data, { inplace: true });
    }
    foundry.utils.setProperty(data, "flags.teriock.createdBy", this.uuid);
    return data;
  }

  /**
   * Construct a family of documents.
   * @param {Partial<FamilyConstruction>} famConstruct
   * @returns {Promise<Partial<ResolvedFamily>>}
   */
  async constructFamily(famConstruct) {
    const { root, children = [], other = [] } = famConstruct;
    const queue = [...(root ? [root] : []), ...children, ...other];
    const results = await Promise.all(
      queue.map((doc) => this.constructDocument(doc)),
    );
    let pointer = 0;
    const rootData = root ? results[pointer++] : null;
    const childrenData = results.slice(pointer, (pointer += children.length));
    for (const child of childrenData) {
      foundry.utils.deleteProperty(child, "flags.teriock.createdBy");
    }
    const otherData = results.slice(pointer);
    return {
      root: rootData,
      children: childrenData,
      other: otherData,
    };
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
          await this.safeCreate(root, fam.children);
        }
      }
    }
    if (fam.other && fam.other.length > 0) {
      await this.safeCreate(actor, fam.other);
    }
  }

  /** @inheritDoc */
  async primaryAction() {
    const familyConstruction = this.event?.altKey
      ? this.secondary
      : this.primary;
    const family = await this.constructFamily(familyConstruction);
    await Promise.all(
      this.actors.map((a) => {
        this.createFamily(a, family);
        ui.notifications.success(
          "TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.added",
          {
            localize: true,
            format: { name: a.name },
          },
        );
      }),
    );
  }

  /**
   * Safely sort and create valid documents.
   * @param {AnyCommonDocument} parent
   * @param {object[]} docs
   * @returns {Promise<AnyChildDocument[]>}
   */
  async safeCreate(parent, docs) {
    const effectTypes = Object.entries(documentOptions)
      .filter(([_k, v]) => v.doc === "ActiveEffect")
      .map(([k, _v]) => k);
    const itemTypes = Object.entries(documentOptions)
      .filter(([_k, v]) => v.doc === "Item")
      .map(([k, _v]) => k);
    const effectData = docs.filter((d) => effectTypes.includes(d?.type));
    const itemData = docs.filter((d) => itemTypes.includes(d?.type));
    const promises = [];
    if (effectData.length > 0) {
      promises.push(parent.createChildDocuments("ActiveEffect", effectData));
    }
    if (itemData.length > 0) {
      promises.push(parent.createChildDocuments("Item", itemData));
    }
    const allChildren = await Promise.all(promises);
    const out = [];
    for (const children of allChildren) out.push(...children);
    return out;
  }

  /** @inheritDoc */
  async secondaryAction() {
    await Promise.all(
      this.actors.map(async (a) => {
        const children = await a.getChildArray();
        const toDelete = children.filter(
          (c) => c.getFlag("teriock", "createdBy") === this.uuid,
        );
        const effectsToDelete = toDelete.filter(
          (d) => d.documentName === "ActiveEffect",
        );
        const itemsToDelete = toDelete.filter((d) => d.documentName === "Item");
        const promises = [];
        if (effectsToDelete.length > 0) {
          promises.push(
            a.deleteChildDocuments(
              "ActiveEffect",
              effectsToDelete.map((e) => e.id),
            ),
          );
        }
        if (itemsToDelete.length > 0) {
          promises.push(
            a.deleteChildDocuments(
              "Item",
              itemsToDelete.map((i) => i.id),
            ),
          );
        }
        await Promise.all(promises);
        ui.notifications.success(
          "TERIOCK.ACTIVATIONS.AddDocuments.NOTIFICATIONS.removed",
          {
            localize: true,
            format: { name: a.name },
          },
        );
      }),
    );
  }
}

function documentConstructionField() {
  return new fields.SchemaField({
    uuid: new fields.DocumentUUIDField(),
    data: new fields.ObjectField({}),
  });
}

function familyConstructionField() {
  return new fields.SchemaField({
    root: documentConstructionField(),
    children: new fields.ArrayField(documentConstructionField()),
    other: new fields.ArrayField(documentConstructionField()),
  });
}
