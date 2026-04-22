import type {
  AbilityMacroAutomation,
  AddDocumentsAutomation,
  AttunementAutomation,
  ChangeCompetenceAutomation,
  ChangeMovementAutomation,
  ChangeQuantityAutomation,
  ChangesAutomation,
  ChatMacroAutomation,
  ChatStatusAutomation,
  CombatExpirationAutomation,
  CommonMacroAutomation,
  CommonOutcomesAutomation,
  DurationAutomation,
  FeatAutomation,
  HacksAutomation,
  HealAutomation,
  ModifyEffectAutomation,
  PropertyMacroAutomation,
  ProtectionAutomation,
  ResistAutomation,
  RevitalizeAutomation,
  RollAutomation,
  RollStyleAutomation,
  StatusAutomation,
  TakeAutomation,
  TemplateAutomation,
  TradecraftAutomation,
  TransformationAutomation,
  UseDocumentsAutomation,
} from "../data/pseudo-documents/automations/_module.mjs";
import type {
  AddDocumentsActivation,
  ApplyStatusActivation,
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
  MacroActivation,
  ReadMagicActivation,
  ReforgeActivation,
  RemoveStatusActivation,
  RepairActivation,
  ResistActivation,
  RevitalizeActivation,
  ReviveActivation,
  RollActivation,
  ShatterActivation,
  StandardDamageActivation,
  TakeActivation,
  TakeHackActivation,
  TakeUnhackActivation,
  ToggleStatusActivation,
  TradecraftActivation,
  UndampenActivation,
  UnglueActivation,
  UseExternalActivation,
  UseLocalActivation,
} from "../data/pseudo-documents/activations/_module.mjs";

declare global {
  namespace Teriock.Automations {
    export interface TypeMap {
      abilityMacro: AbilityMacroAutomation;
      addDocuments: AddDocumentsAutomation;
      attunement: AttunementAutomation;
      changeCompetence: ChangeCompetenceAutomation;
      changeMovement: ChangeMovementAutomation;
      changeQuantity: ChangeQuantityAutomation;
      changes: ChangesAutomation;
      chatMacro: ChatMacroAutomation;
      chatStatus: ChatStatusAutomation;
      combatExpiration: CombatExpirationAutomation;
      common: CommonOutcomesAutomation;
      commonMacro: CommonMacroAutomation;
      duration: DurationAutomation;
      feat: FeatAutomation;
      hacks: HacksAutomation;
      heal: HealAutomation;
      modifyEffect: ModifyEffectAutomation;
      propertyMacro: PropertyMacroAutomation;
      protection: ProtectionAutomation;
      resist: ResistAutomation;
      revitalize: RevitalizeAutomation;
      roll: RollAutomation;
      rollStyle: RollStyleAutomation;
      status: StatusAutomation;
      take: TakeAutomation;
      template: TemplateAutomation;
      tradecraft: TradecraftAutomation;
      transformation: TransformationAutomation;
      useDocuments: UseDocumentsAutomation;
    }

    export type Type = keyof TypeMap;
    export type Any = TypeMap[Type];
  }

  namespace Teriock.Activations {
    export interface TypeMap {
      addDocuments: AddDocumentsActivation;
      apply: ApplyStatusActivation;
      attune: AttuneActivation;
      awaken: AwakenActivation;
      bag: DeathBagActivation;
      changeMovement: ChangeMovementActivation;
      dampen: DampenActivation;
      deattune: DeattuneActivation;
      destroy: DestroyActivation;
      feat: FeatActivation;
      glue: GlueActivation;
      hack: TakeHackActivation;
      heal: HealActivation;
      identify: IdentifyActivation;
      macro: MacroActivation;
      readMagic: ReadMagicActivation;
      reforge: ReforgeActivation;
      remove: RemoveStatusActivation;
      repair: RepairActivation;
      resist: ResistActivation;
      revitalize: RevitalizeActivation;
      revive: ReviveActivation;
      roll: RollActivation;
      shatter: ShatterActivation;
      standardDamage: StandardDamageActivation;
      take: TakeActivation;
      toggle: ToggleStatusActivation;
      tradecraft: TradecraftActivation;
      undampen: UndampenActivation;
      unglue: UnglueActivation;
      unhack: TakeUnhackActivation;
      "use-external": UseExternalActivation;
      "use-local": UseLocalActivation;
    }

    export type Type = keyof TypeMap;
    export type Any = TypeMap[Type];
  }
}

export {};
