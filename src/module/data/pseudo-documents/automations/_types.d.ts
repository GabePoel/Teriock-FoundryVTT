import {
  AddDocumentsAutomation,
  AttackAutomation,
  AttunementAutomation,
  ChangeCompetenceAutomation,
  ChangeMovementAutomation,
  ChangeQuantityAutomation,
  ChangesAutomation,
  ChildChangeAutomation,
  CommonOutcomesAutomation,
  CoverAutomation,
  DurationAutomation,
  FeatAutomation,
  HacksAutomation,
  HealAutomation,
  LightAutomation,
  MacroAutomation,
  OverrideAutomation,
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
import { BaseAutomation } from "./abstract/_module.mjs";

declare global {
  export interface AutomationTypeMap {
    addDocuments: AddDocumentsAutomation;
    attack: AttackAutomation;
    attunement: AttunementAutomation;
    changeCompetence: ChangeCompetenceAutomation;
    changeMovement: ChangeMovementAutomation;
    changeQuantity: ChangeQuantityAutomation;
    changes: ChangesAutomation;
    childChange: ChildChangeAutomation;
    common: CommonOutcomesAutomation;
    cover: CoverAutomation;
    duration: DurationAutomation;
    feat: FeatAutomation;
    hacks: HacksAutomation;
    heal: HealAutomation;
    light: LightAutomation;
    macro: MacroAutomation;
    move: RepositionAutomation;
    override: OverrideAutomation;
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

  export type AutomationType = TypeMapKey<AutomationTypeMap>;
  export type Automation<T extends AutomationType = AutomationType> = AutomationTypeMap[T] & BaseAutomation;
}

export {};
