declare module "./equipment-preview-model.mjs" {
  export default interface EquipmentPreviewModel {
    filters: Teriock.Models.BaseFilters & {
      attuned: boolean | null;
      consumable: boolean | null;
      equipmentClasses: Teriock.Keys.EquipmentClass | null;
      equipped: boolean | null;
      identified: boolean | null;
      kind: Teriock.Keys.EquipmentKind | null;
      properties: string | null;
      weaponFightingStyles: string | null;
    };
  }
}

export {};
