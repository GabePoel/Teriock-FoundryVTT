import { preLocalize } from "../../helpers/localization.mjs";

export const displayOptions = {
  sizes: {
    tiny: "TERIOCK.SHEETS.Common.CARD.Sizes.tiny",
    small: "TERIOCK.SHEETS.Common.CARD.Sizes.small",
    medium: "TERIOCK.SHEETS.Common.CARD.Sizes.medium",
    large: "TERIOCK.SHEETS.Common.CARD.Sizes.large",
  },
  abilitySortOrders: {
    name: "TERIOCK.SHEETS.Common.SORT.name",
    enabled: "TERIOCK.SHEETS.Common.SORT.enabled",
    sourceName: "TERIOCK.SHEETS.Common.SORT.sourceName",
    sourceType: "TERIOCK.SHEETS.Common.SORT.sourceType",
    type: "TERIOCK.SHEETS.Common.SORT.type",
  },
  equipmentSortOrders: {
    name: "TERIOCK.SHEETS.Common.SORT.name",
    av: "TERIOCK.SYSTEMS.Armament.FIELDS.av.raw.label",
    bv: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label",
    consumable: "TERIOCK.SYSTEMS.Consumable.FIELDS.consumable.label",
    damage: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.base.raw.label",
    dampened: "TERIOCK.SYSTEMS.Equipment.FIELDS.dampened.label",
    equipmentType: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentType.label",
    equipped: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipped.label",
    minStr: "TERIOCK.SYSTEMS.Equipment.FIELDS.minStr.raw.label",
    powerLevel: "TERIOCK.SYSTEMS.Equipment.FIELDS.powerLevel.label",
    shattered: "TERIOCK.SYSTEMS.Equipment.FIELDS.shattered.label",
    tier: "TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label",
    weight: "TERIOCK.SYSTEMS.Equipment.FIELDS.weight.raw.label",
  },
};

preLocalize("options.display.sizes");
preLocalize("options.display.abilitySortOrders");
preLocalize("options.display.equipmentSortOrders");
