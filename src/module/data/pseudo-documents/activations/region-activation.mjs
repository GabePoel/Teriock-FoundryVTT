import { omit } from "../../../helpers/utils.mjs";
import { SelectionPseudoDocumentMixin } from "../mixins/_module.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes SelectionPseudoDocument
 */
export default class RegionActivation extends SelectionPseudoDocumentMixin(BaseActivation) {
  /** @inheritDoc */
  static get ICON() {
    return TERIOCK.display.icons.document.region;
  }

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ACTIVATIONS.Region.BUTTON";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "region";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(
      omit(super.defineSchema(), [
        "expandFolders",
        "expandTables",
        "localIdentifiers",
        "localQualifier",
        "localUuids",
        "makeSeparateActivations",
        "selectInExecution",
      ]),
      { attachToToken: new fields.BooleanField(), data: new fields.ObjectField() },
    );
  }

  /** @inheritDoc */
  get _selectionRelativeTo() {
    return this.document?.speakerActor ?? null;
  }

  /** @inheritDoc */
  get _selectionTitle() {
    return this.label;
  }

  /** @inheritDoc */
  get visible() {
    return game.user.hasPermission("REGION_CREATE") && game.user.hasPermission("QUERY_USER");
  }

  /**
   * @inheritDoc
   * @returns {Promise<TeriockRegionDocument|null>}
   */
  async primaryAction() {
    if (!game.teriock.checkScene()) { return null; }
    const data = foundry.utils.mergeObject(this.data, {
      flags: { teriock: { createdBy: this.uuid, placedBy: game.user.id } },
      ownership: { [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER },
    });
    const uuids = (await this.selectDocuments()).map(d => d.uuid);
    if (uuids.length) {
      data.behaviors ??= [];
      data.behaviors.push({
        name: _loc("TYPES.RegionBehavior.applyActiveEffect"),
        system: { effects: uuids },
        type: "applyActiveEffect",
      });
    }
    data.color ??= game.user.color;
    await game.teriock.minimizeStart();
    const region = await canvas.regions.placeRegion(data, {
      allowRotation: true,
      attachToToken: this.attachToToken,
      createOptions: { asGM: true },
    });
    await game.teriock.minimizeEnd();
    return region;
  }

  /** @inheritDoc */
  async secondaryAction() {
    if (!game.teriock.checkScene()) { return; }
    await canvas.scene.deleteEmbeddedDocuments(
      "Region",
      canvas.scene.regions.contents.filter(r =>
        r.getFlag("teriock", "createdBy") === this.uuid
        && r.getFlag("teriock", "placedBy") === this.user.id
        && r.isOwner
      ).map(r => r.id),
    );
  }
}
