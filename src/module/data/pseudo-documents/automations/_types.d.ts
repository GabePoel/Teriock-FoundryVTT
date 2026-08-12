import {
  AbilityMacroAutomation,
  AddDocumentsAutomation,
  AttackAutomation,
  AttunementAutomation,
  ChangeCompetenceAutomation,
  ChangeMovementAutomation,
  ChangeQuantityAutomation,
  ChangesAutomation,
  ChatMacroAutomation,
  ChatStatusAutomation,
  ChildChangeAutomation,
  CommonMacroAutomation,
  CommonOutcomesAutomation,
  CoverAutomation,
  DurationAutomation,
  FeatAutomation,
  HacksAutomation,
  HealAutomation,
  LightAutomation,
  OverrideAutomation,
  PropertyMacroAutomation,
  RegionAutomation,
  RepositionAutomation,
  ResistAutomation,
  RevitalizeAutomation,
  RollAutomation,
  RollStyleAutomation,
  StatusAutomation,
  SummonAutomation,
  SuppressAutomation,
  TakeAutomation,
  ToggleChildrenAutomation,
  TradecraftAutomation,
  TransformationAutomation,
  UseDocumentsAutomation,
} from "./_module.mjs";

declare module "./transformation-automation.mjs" {
  export default interface TransformationAutomation extends Teriock.Transformation.AutomationTransformationConfig {}
}

declare global {
  export interface AutomationTypeMap {
    abilityMacro: AbilityMacroAutomation;
    addDocuments: AddDocumentsAutomation;
    attack: AttackAutomation;
    attunement: AttunementAutomation;
    changeCompetence: ChangeCompetenceAutomation;
    changeMovement: ChangeMovementAutomation;
    changeQuantity: ChangeQuantityAutomation;
    changes: ChangesAutomation;
    chatMacro: ChatMacroAutomation;
    chatStatus: ChatStatusAutomation;
    childChange: ChildChangeAutomation;
    common: CommonOutcomesAutomation;
    commonMacro: CommonMacroAutomation;
    cover: CoverAutomation;
    duration: DurationAutomation;
    feat: FeatAutomation;
    hacks: HacksAutomation;
    heal: HealAutomation;
    light: LightAutomation;
    move: RepositionAutomation;
    override: OverrideAutomation;
    propertyMacro: PropertyMacroAutomation;
    region: RegionAutomation;
    resist: ResistAutomation;
    revitalize: RevitalizeAutomation;
    roll: RollAutomation;
    rollStyle: RollStyleAutomation;
    status: StatusAutomation;
    summon: SummonAutomation;
    suppress: SuppressAutomation;
    take: TakeAutomation;
    toggleChildren: ToggleChildrenAutomation;
    tradecraft: TradecraftAutomation;
    transformation: TransformationAutomation;
    useDocuments: UseDocumentsAutomation;
  }

  namespace Teriock.Automations {
    export type TypeMap = AutomationTypeMap;
    export type Type = TypeMapKey<AutomationTypeMap>;
    export type Any = AnyAutomation;
  }
}

export {};
