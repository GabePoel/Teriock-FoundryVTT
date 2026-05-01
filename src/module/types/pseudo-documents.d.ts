import * as automations from "../data/pseudo-documents/automations/_module.mjs";
import * as activations from "../data/pseudo-documents/activations/_module.mjs";

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
      combatExpiration: automations.CombatExpirationAutomation;
      common: automations.CommonOutcomesAutomation;
      commonMacro: automations.CommonMacroAutomation;
      duration: automations.DurationAutomation;
      eventExpiration: automations.EventExpirationAutomation;
      feat: automations.FeatAutomation;
      hacks: automations.HacksAutomation;
      heal: automations.HealAutomation;
      modifyEffect: automations.ModifyEffectAutomation;
      propertyMacro: automations.PropertyMacroAutomation;
      protection: automations.ProtectionAutomation;
      region: automations.RegionAutomation;
      resist: automations.ResistAutomation;
      revitalize: automations.RevitalizeAutomation;
      roll: automations.RollAutomation;
      rollStyle: automations.RollStyleAutomation;
      status: automations.StatusAutomation;
      take: automations.TakeAutomation;
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
      dampen: activations.DampenActivation;
      deattune: activations.DeattuneActivation;
      destroy: activations.DestroyActivation;
      feat: activations.FeatActivation;
      glue: activations.GlueActivation;
      hack: activations.TakeHackActivation;
      heal: activations.HealActivation;
      identify: activations.IdentifyActivation;
      macro: activations.MacroActivation;
      readMagic: activations.ReadMagicActivation;
      reforge: activations.ReforgeActivation;
      remove: activations.RemoveStatusActivation;
      repair: activations.RepairActivation;
      resist: activations.ResistActivation;
      revitalize: activations.RevitalizeActivation;
      revive: activations.ReviveActivation;
      roll: activations.RollActivation;
      shatter: activations.ShatterActivation;
      standardDamage: activations.StandardDamageActivation;
      take: activations.TakeActivation;
      toggle: activations.ToggleStatusActivation;
      tradecraft: activations.TradecraftActivation;
      undampen: activations.UndampenActivation;
      unglue: activations.UnglueActivation;
      unhack: activations.TakeUnhackActivation;
      "use-external": activations.UseExternalActivation;
      "use-local": activations.UseLocalActivation;
    }

    export type Type = keyof TypeMap;
    export type Any = TypeMap[Type];
  }
}

export {};
