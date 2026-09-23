import { migrateThumbnails } from "../../data/fields/tools/migrations.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Card } = foundry.documents;

/**
 * The Teriock Card implementation.
 * @mixes BaseDocument
 */
export default class TeriockCard extends mixClasses(Card, BaseDocumentMixin) {
  /** @inheritDoc */
  static migrateData(source, options) {
    migrateThumbnails(source, "back.img");
    for (const face of source.faces ?? []) { migrateThumbnails(face, "img"); }
    return super.migrateData(source, options);
  }
}
