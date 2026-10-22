import {
  dotJoin,
  fromIdentifier,
  getName,
  mergeMetadata,
  mixClasses,
  toKebabCase,
} from "../../../../utils/_module.mjs";
import { equipmentTypeField } from "../../../fields/tools/builders.mjs";
import { documentSettingsModels } from "../../../models/_module.mjs";
import {
  ArmamentSystemMixin,
  AttunableSystemMixin,
  ConsumableSystemMixin,
  WikiSystemMixin,
} from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";
import {
  EquipmentIdentificationPart,
  EquipmentPanelPart,
  EquipmentStoragePart,
  EquipmentSuppressionPart,
  EquipmentWieldingPart,
} from "./parts/_module.mjs";

const { fields } = foundry.data;

/**
 * Equipment-specific item data model.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
 * @extends {BaseItemSystem}
 * @mixes ArmamentSystem
 * @mixes AttunableSystem
 * @mixes ConsumableSystem
 * @mixes WikiSystem
 * @mixes EquipmentIdentificationPart
 * @mixes EquipmentPanelPart
 * @mixes EquipmentStoragePart
 * @mixes EquipmentSuppressionPart
 * @mixes EquipmentWieldingPart
 */
export default class EquipmentSystem
  extends mixClasses(
    BaseItemSystem,
    ArmamentSystemMixin,
    AttunableSystemMixin,
    ConsumableSystemMixin,
    WikiSystemMixin,
    EquipmentIdentificationPart,
    EquipmentPanelPart,
    EquipmentStoragePart,
    EquipmentSuppressionPart,
    EquipmentWieldingPart,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Equipment"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    childTypes: ["equipment", ...super.metadata.childTypes],
    icon: TERIOCK.DISPLAY.icons.manifest.document.equipment,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.equipment,
    importable: true,
    initialKind: "mundane",
    kinds: _replace(TERIOCK.CONFIG.equipment.kind),
    preserveOnRefresh: [
      "img",
      "name",
      "system.description",
      "system.flaws",
      "system.notes",
      "system.kind",
      "system.consumable.maxFormula",
      ...super.metadata.preserveOnRefresh,
    ],
    tags: { usable: true },
    type: "equipment",
    visibleTypes: ["equipment", ...super.metadata.visibleTypes],
  });

  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.child.EquipmentExecution;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumable: new fields.BooleanField({ initial: false }),
      equipmentType: equipmentTypeField({ blank: true, initial: "", required: false }),
      settings: new fields.EmbeddedDataField(documentSettingsModels.equipment),
    });
  }

  /** @inheritDoc */
  static async importDocument(createOptions = {}, options = {}) {
    return super.importDocument(createOptions, options, {
      globalIdentifiers: Array.from(game.teriock.identifiers.equipmentTypes.keys(), e => `equipment:${e}`),
      globalTypes: [],
    });
  }

  /** @inheritDoc */
  get _color() {
    if (this.storage.count.over || this.storage.weight.over) { return TERIOCK.DISPLAY.colors.palette.red; }
    if (!this.identification.read) { return TERIOCK.DISPLAY.colors.palette.grey; }
    return super._color;
  }

  /** @inheritDoc */
  get _displayInputs() {
    return ["system.equipmentClasses", ...super._displayInputs];
  }

  /** @inheritDoc */
  get _displayTags() {
    return [...super._displayTags, ...this._identificationTags, ...this._attunableTags];
  }

  /** @inheritDoc */
  get _displayToggles() {
    return ["system.consumable", ...super._displayToggles];
  }

  /** @inheritDoc */
  get _refreshPromises() {
    const promises = super._refreshPromises;
    if (this.equipmentType) {
      promises.push(
        this._formatRefreshPromise(
          fromIdentifier(this.equipmentType),
          "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentType.label",
        ),
      );
    }
    return promises;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    return Object.assign(parts, {
      subtitle: !this.consumable ? getName(this.equipmentType) : parts.subtitle,
      text: dotJoin([
        ...this._attunableWrappers,
        _loc("TERIOCK.SYSTEMS.Equipment.PANELS.weight", { value: this.totalWeight }),
        parts.text,
      ]),
    });
  }

  /**
   * @inheritDoc
   * @returns {TypedIdentifier|null}
   */
  get wikiIdentifier() {
    return this.equipmentType;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    if (this.actor) { this.updateSource({ equipped: true }); }
  }

  /** @inheritDoc */
  getLocalRollData() {
    return Object.assign(super.getLocalRollData(), {
      [`type.${toKebabCase(this._source.equipmentType)}`]: 1,
      price: this.price,
    });
  }
}
