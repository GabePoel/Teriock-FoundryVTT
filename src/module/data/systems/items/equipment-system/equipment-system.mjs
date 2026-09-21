import equipmentConfig from "../../../../constants/config/equipment-config.mjs";
import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { dotJoin, toCamelCase, toKebabCase } from "../../../../helpers/string.mjs";
import { fromIdentifier, getName, objectMap } from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
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

// TODO: Find some way to safely inherit this from identifiers instead of a pre-defined set of keys.
// The reason we can't do this is because equipment can be assigned identifiers that will appear in the registry even if
// they aren't for a mundane equipment type.
const EQUIPMENT_TYPES = {};

/**
 * Equipment-specific item data model.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
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
    initialKind: "mundane",
    kinds: _replace(equipmentConfig.kind),
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
    return teriock.executions.document.EquipmentExecution;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumable: new fields.BooleanField({ initial: false }),
      equipmentType: new IdentifierField({
        autocomplete: true,
        blank: true,
        initial: "",
        required: false,
        type: "equipment",
        suggestions: () => {
          if (Object.keys(EQUIPMENT_TYPES).length === 0) {
            Object.assign(EQUIPMENT_TYPES, objectMap(TERIOCK.reference.equipment, undefined, { kebabify: true }));
          }
          return EQUIPMENT_TYPES;
        },
      }),
      settings: new fields.EmbeddedDataField(documentSettingsModels.equipment),
    });
  }

  /** @inheritDoc */
  get _color() {
    if (this.isOverCapacity) { return TERIOCK.display.colors.palette.red; }
    if (!this.identification.read) { return TERIOCK.display.colors.palette.grey; }
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

  /** @inheritDoc */
  get wikiPage() {
    return `Equipment:${TERIOCK.index.equipment[toCamelCase(this._source.equipmentType ?? "")] ?? ""}`;
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
