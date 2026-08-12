import {
  AddDocumentsActivation,
  ApplyStatusActivation,
  AttackActivation,
  AttuneActivation,
  AwakenActivation,
  ChangeMovementActivation,
  ChangeQuantityActivation,
  DampenActivation,
  DeathBagActivation,
  DeattuneActivation,
  DestroyActivation,
  FeatActivation,
  GlueActivation,
  HealActivation,
  IdentifyActivation,
  LongRestActivation,
  MacroActivation,
  MoveActivation,
  ReadMagicActivation,
  ReforgeActivation,
  RegionActivation,
  RemoveStatusActivation,
  RepairActivation,
  ResistActivation,
  RevitalizeActivation,
  ReviveActivation,
  RollActivation,
  ShatterActivation,
  ShortRestActivation,
  StandardDamageActivation,
  SummonActivation,
  TakeActivation,
  TakeCoverActivation,
  TakeHackActivation,
  TakeUncoverActivation,
  TakeUnhackActivation,
  ToggleStatusActivation,
  TradecraftActivation,
  UndampenActivation,
  UnglueActivation,
  UseDocumentsActivation,
  UseExternalActivation,
  UseLocalActivation,
} from "./_module.mjs";

declare global {
  export interface ActivationTypeMap {
    addDocuments: AddDocumentsActivation;
    apply: ApplyStatusActivation;
    attack: AttackActivation;
    attune: AttuneActivation;
    awaken: AwakenActivation;
    bag: DeathBagActivation;
    changeMovement: ChangeMovementActivation;
    changeQuantity: ChangeQuantityActivation;
    cover: TakeCoverActivation;
    dampen: DampenActivation;
    deattune: DeattuneActivation;
    destroy: DestroyActivation;
    feat: FeatActivation;
    glue: GlueActivation;
    hack: TakeHackActivation;
    heal: HealActivation;
    identify: IdentifyActivation;
    longRest: LongRestActivation;
    macro: MacroActivation;
    move: MoveActivation;
    readMagic: ReadMagicActivation;
    reforge: ReforgeActivation;
    region: RegionActivation;
    remove: RemoveStatusActivation;
    repair: RepairActivation;
    resist: ResistActivation;
    revitalize: RevitalizeActivation;
    revive: ReviveActivation;
    roll: RollActivation;
    shatter: ShatterActivation;
    shortRest: ShortRestActivation;
    standardDamage: StandardDamageActivation;
    summon: SummonActivation;
    take: TakeActivation;
    toggle: ToggleStatusActivation;
    tradecraft: TradecraftActivation;
    undampen: UndampenActivation;
    unglue: UnglueActivation;
    uncover: TakeUncoverActivation;
    unhack: TakeUnhackActivation;
    useDocuments: UseDocumentsActivation;
    useExternal: UseExternalActivation;
    useLocal: UseLocalActivation;
  }

  export type ActivationType = TypeMapKey<ActivationTypeMap>;
  export type Activation<T extends ActivationType = ActivationType> = ActivationTypeMap[T];
}

export {};
