import { TeriockItem } from "../../../documents/_module.mjs";
import { BodySystem, EquipmentSystem, MountSystem } from "../../systems/items/_module.mjs";
import { TypedPseudoDocument } from "../abstract/_module.mjs";

const { fields } = foundry.data;

const TYPES = {};

export class BasePseudoItem extends TypedPseudoDocument {
  static get documentName() {
    return "Item";
  }

  /** @inheritDoc */
  static get metdata() {
    return Object.assign(super.metdata, { documentName: "Item" });
  }

  /** @inheritDoc */
  static get TYPES() {
    return Object.values(TYPES);
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      _stats: new fields.DocumentStatsField(),
      flags: new fields.DocumentFlagsField(),
      img: new fields.FilePathField({
        categories: ["IMAGE"],
        initial: data => TeriockItem.getDefaultArtwork(data).img,
      }),
      name: new fields.StringField({ required: true, blank: false, textSearch: true }),
      ownership: new fields.DocumentOwnershipField(),
      sort: new fields.IntegerSortField(),
      system: new fields.TypeDataField(TeriockItem, { required: false }),
      type: new fields.DocumentTypeField(TeriockItem),
    });
  }
}

/**
 * @param type
 * @param system
 */
function TypedPseudoItemFactory(type, system) {
  class TypedPseudoItem extends BasePseudoItem {
    /** @inheritDoc */
    static get TYPE() {
      return type;
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { system: new fields.EmbeddedDataField(system) });
    }
  }
  TYPES[type] = TypedPseudoItem;
  return TypedPseudoItem;
}

export const PseudoEquipment = TypedPseudoItemFactory("equipment", EquipmentSystem);
export const PseudoMount = TypedPseudoItemFactory("mount", MountSystem);
export const PsuedoBody = TypedPseudoItemFactory("body", BodySystem);
