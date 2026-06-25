import * as activations from "../data/pseudo-documents/activations/_module.mjs";
import * as automations from "../data/pseudo-documents/automations/_module.mjs";
import * as expirations from "../data/pseudo-documents/expirations/_module.mjs";

declare global {
  namespace Teriock.Automations {
    export interface TypeMap {
      abilityMacro: automations.AbilityMacroAutomation;
      addDocuments: automations.AddDocumentsAutomation;
      attunement: automations.AttunementAutomation;
      changeCompetence: automations.ChangeCompetenceAutomation;
      changeMovement: automations.ChangeMovementAutomation;
      changeQuantity: automations.ChangeQuantityAutomation;
      changes: automations.ChangesAutomation;
      chatMacro: automations.ChatMacroAutomation;
      chatStatus: automations.ChatStatusAutomation;
      childChange: automations.ChildChangeAutomation;
      common: automations.CommonOutcomesAutomation;
      commonMacro: automations.CommonMacroAutomation;
      cover: automations.CoverAutomation;
      duration: automations.DurationAutomation;
      expiration: automations.ExpirationAutomation;
      feat: automations.FeatAutomation;
      hacks: automations.HacksAutomation;
      heal: automations.HealAutomation;
      move: automations.MoveAutomation;
      override: automations.OverrideAutomation;
      propertyMacro: automations.PropertyMacroAutomation;
      protection: automations.ProtectionAutomation;
      region: automations.RegionAutomation;
      resist: automations.ResistAutomation;
      revitalize: automations.RevitalizeAutomation;
      roll: automations.RollAutomation;
      rollStyle: automations.RollStyleAutomation;
      status: automations.StatusAutomation;
      summon: automations.SummonAutomation;
      take: automations.TakeAutomation;
      toggleChildren: automations.ToggleChildrenAutomation;
      tradecraft: automations.TradecraftAutomation;
      transformation: automations.TransformationAutomation;
      useDocuments: automations.UseDocumentsAutomation;
    }

    export type Type = keyof TypeMap;
    export type Any = TypeMap[Type];
  }

  namespace Teriock.Activations {
    export interface TypeMap {
      addDocuments: activations.AddDocumentsActivation;
      apply: activations.ApplyStatusActivation;
      attune: activations.AttuneActivation;
      awaken: activations.AwakenActivation;
      bag: activations.DeathBagActivation;
      changeMovement: activations.ChangeMovementActivation;
      cover: activations.TakeCoverActivation;
      dampen: activations.DampenActivation;
      deattune: activations.DeattuneActivation;
      destroy: activations.DestroyActivation;
      feat: activations.FeatActivation;
      glue: activations.GlueActivation;
      hack: activations.TakeHackActivation;
      heal: activations.HealActivation;
      identify: activations.IdentifyActivation;
      longRest: activations.LongRestActivation;
      macro: activations.MacroActivation;
      move: activations.MoveActivation;
      readMagic: activations.ReadMagicActivation;
      reforge: activations.ReforgeActivation;
      remove: activations.RemoveStatusActivation;
      repair: activations.RepairActivation;
      resist: activations.ResistActivation;
      revitalize: activations.RevitalizeActivation;
      revive: activations.ReviveActivation;
      roll: activations.RollActivation;
      shatter: activations.ShatterActivation;
      shortRest: activations.ShortRestActivation;
      standardDamage: activations.StandardDamageActivation;
      summon: activations.SummonActivation;
      take: activations.TakeActivation;
      toggle: activations.ToggleStatusActivation;
      tradecraft: activations.TradecraftActivation;
      undampen: activations.UndampenActivation;
      unglue: activations.UnglueActivation;
      uncover: activations.TakeUncoverActivation;
      unhack: activations.TakeUnhackActivation;
      useExternal: activations.UseExternalActivation;
      useLocal: activations.UseLocalActivation;
    }

    export type Type = keyof TypeMap;
    export type Any = TypeMap[Type];
  }

  namespace Teriock.Expirations {
    export interface TypeMap {
      combat: expirations.CombatExpiration;
      status: expirations.StatusExpiration;
      time: expirations.TimeExpiration;
      trigger: expirations.TriggerExpiration;
    }

    export type Type = keyof TypeMap;
    export type Any = TypeMap[Type];
  }
}

export {};
