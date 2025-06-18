export interface BarData {
  min: number;
  max: number;
  value: number;
}

export interface AttributeData {
  value: number;
  saveProficient: boolean;
  saveFluent: boolean;
}

export interface HackData {
  min: number;
  max: number;
  value: number;
}

interface DisplayField {
  size: string;
  gapless: boolean;
}

interface SheetMenus {
  abilityFilters: boolean;
  abilityOptions: boolean;
  abilitySort: boolean;
  equipmentFilters: boolean;
  equipmentOptions: boolean;
  equipmentSort: boolean;
  fluencyOptions: boolean;
  resourceOptions: boolean;
  rankOptions: boolean;
  powerOptions: boolean;
  effectOptions: boolean;
}

interface AbilityFilters {
  search: string;
  basic: number;
  standard: number;
  skill: number;
  spell: number;
  ritual: number;
  rotator: number;
  verbal: number;
  somatic: number;
  material: number;
  invoked: number;
  sustained: number;
  broken: number;
  hp: number;
  mp: number;
  heightened: number;
  expansion: number;
  maneuver: string | null;
  interaction: string | null;
  powerSource: string | null;
  element: string | null;
  effects: string[];
}

interface EquipmentFilters {
  search: string;
  equipped: number;
  shattered: number;
  consumable: number;
  identified: number;
  properties: string;
  materialProperties: string;
  magicalProperties: string;
  weaponFightingStyles: string;
  equipmentClasses: string;
  powerLevel: string;
}

interface SheetDisplay {
  ability: DisplayField;
  fluency: DisplayField;
  rank: DisplayField;
  equipment: DisplayField;
  power: DisplayField;
  resource: DisplayField;
  condition: DisplayField;
  effect: DisplayField;
}

export interface SheetData {
  activeTab: string;
  menus: SheetMenus;
  abilityFilters: AbilityFilters;
  equipmentFilters: EquipmentFilters;
  abilitySortOption: string;
  abilitySortAscending: boolean;
  equipmentSortOption: string;
  equipmentSortAscending: boolean;
  display: SheetDisplay;
  notes: string;
  dieBox: string;
  primaryBlocker: string | null;
  primaryAttacker: string | null;
}

export interface TradecraftData {
  proficient: boolean;
  extra: number;
  bonus: number;
}
