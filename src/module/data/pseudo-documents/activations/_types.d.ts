import {
  AddDocumentsActivation,
  ApplyStatusActivation,
  AttackActivation,
  AttuneActivation,
  AwakenActivation,
  ChangeMovementActivation,
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
  UseExternalActivation,
  UseLocalActivation,
} from "./_module.mjs";

declare global {
  namespace Teriock.Activations {
    export interface TypeMap {
      addDocuments: AddDocumentsActivation;
      apply: ApplyStatusActivation;
      attack: AttackActivation;
      attune: AttuneActivation;
      awaken: AwakenActivation;
      bag: DeathBagActivation;
      changeMovement: ChangeMovementActivation;
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
      useExternal: UseExternalActivation;
      useLocal: UseLocalActivation;
    }

    export type Type = keyof TypeMap;
    export type Any = TypeMap[Type];
  }
}
