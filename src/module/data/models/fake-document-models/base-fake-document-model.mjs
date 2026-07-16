import { dotJoin } from "../../../helpers/string.mjs";
import { BaseDataModel } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Something an actor derives during preparation that is displayed as though it were a document, but is not one.
 * @extends {BaseDataModel}
 * @property {Teriock.System.ImageString} img
 * @property {Set<string>} providers
 */
export default class BaseFakeDocumentModel extends BaseDataModel {
  /**
   * The name this stands in for, used to build {@link uuid}.
   * @returns {string}
   */
  static get FAKE_NAME() {
    return "Fake";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      img: new fields.FilePathField({ categories: ["IMAGE"] }),
      providers: new fields.SetField(new fields.StringField()),
    });
  }

  /**
   * Icons denoting something about this.
   * @returns {Teriock.EmbedData.EmbedIcon[]}
   */
  get _embedIcons() {
    return [];
  }

  /**
   * The block this renders as.
   * @returns {Teriock.EmbedData.EmbedParts}
   */
  get embedParts() {
    return {
      draggable: false,
      icons: this._embedIcons,
      identifier: this.identifier,
      img: this.img,
      openable: false,
      subtitle: this.subtitle,
      text: this.text,
      title: this.name,
      uuid: this.uuid,
    };
  }

  /**
   * A key unique among the fakes of this kind on a single actor.
   * @returns {string}
   */
  get id() {
    return "";
  }

  /**
   * The document this stands for. Clicking the block opens whatever this refers to.
   * @returns {TypedIdentifier | string}
   */
  get identifier() {
    return "";
  }

  /**
   * Used for searching and sorting.
   * @returns {string}
   */
  get name() {
    return "";
  }

  /**
   * @returns {string}
   */
  get subtitle() {
    return "";
  }

  /**
   * The things that give this to the actor.
   * @returns {string}
   */
  get text() {
    return dotJoin(Array.from(this.providers));
  }

  /**
   * A stable "uuid" that is deliberately not resolvable.
   * @returns {string}
   */
  get uuid() {
    return `${this.constructor.FAKE_NAME}.${this.id}`;
  }
}
