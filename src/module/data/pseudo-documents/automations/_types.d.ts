import {
  AddDocumentsAutomation,
  AttackAutomation,
  AttunementAutomation,
  ChangeCompetenceAutomation,
  ChangeMovementAutomation,
  ChangeQuantityAutomation,
  ChangesAutomation,
  ChildChangeAutomation,
  ChoicesAutomation,
  CommonOutcomesAutomation,
  ConsumptionAutomation,
  CostAutomation,
  CoverAutomation,
  DurationAutomation,
  ElderSorceryAutomation,
  FeatAutomation,
  HacksAutomation,
  HealAutomation,
  LightAutomation,
  MacroAutomation,
  MorphAutomation,
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
  TargetAutomation,
  ToggleChildrenAutomation,
  TradecraftAutomation,
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
    choices: ChoicesAutomation;
    common: CommonOutcomesAutomation;
    consumption: ConsumptionAutomation;
    cost: CostAutomation;
    cover: CoverAutomation;
    duration: DurationAutomation;
    elderSorcery: ElderSorceryAutomation;
    feat: FeatAutomation;
    hacks: HacksAutomation;
    heal: HealAutomation;
    light: LightAutomation;
    macro: MacroAutomation;
    morph: MorphAutomation;
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
    target: TargetAutomation;
    toggleChildren: ToggleChildrenAutomation;
    tradecraft: TradecraftAutomation;
    useDocuments: UseDocumentsAutomation;
  }

  export type AutomationType = TypeMapKey<AutomationTypeMap>;
  export type Automation<T extends AutomationType = AutomationType> = AutomationTypeMap[T] & BaseAutomation;
}

export {};
