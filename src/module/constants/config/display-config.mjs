import { preLocalizeConfig } from "../../helpers/localization.mjs";

export default {
  abilitySortOrders: {
    enabled: "TERIOCK.SHEETS.Common.SORT.enabled",
    name: "TERIOCK.SHEETS.Common.SORT.name",
    sourceName: "TERIOCK.SHEETS.Common.SORT.sourceName",
    sourceType: "TERIOCK.SHEETS.Common.SORT.sourceType",
    type: "TERIOCK.SHEETS.Common.SORT.type",
  },
  equipmentSortOrders: {
    av: "TERIOCK.SYSTEMS.Armament.FIELDS.av.raw.label",
    bv: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label",
    consumable: "TERIOCK.SYSTEMS.Consumable.FIELDS.consumable.label",
    damage: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.label",
    dampened: "TERIOCK.SYSTEMS.Equipment.FIELDS.dampened.label",
    equipmentType: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentType.label",
    equipped: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipped.label",
    minStr: "TERIOCK.SYSTEMS.Equipment.FIELDS.minStr.label",
    name: "TERIOCK.SHEETS.Common.SORT.name",
    powerLevel: "TERIOCK.SYSTEMS.Equipment.FIELDS.powerLevel.label",
    shattered: "TERIOCK.SYSTEMS.Equipment.FIELDS.shattered.label",
    tier: "TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label",
    weight: "TERIOCK.SYSTEMS.Equipment.FIELDS.weight.label",
  },
  // no sort
  sizes: {
    tiny: "TERIOCK.SHEETS.Common.CARD.Sizes.tiny",
    small: "TERIOCK.SHEETS.Common.CARD.Sizes.small",
    medium: "TERIOCK.SHEETS.Common.CARD.Sizes.medium",
    large: "TERIOCK.SHEETS.Common.CARD.Sizes.large",
  },
};

preLocalizeConfig("config.display.sizes");
preLocalizeConfig("config.display.abilitySortOrders");
preLocalizeConfig("config.display.equipmentSortOrders");
