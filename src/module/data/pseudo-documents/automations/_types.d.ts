import "./abstract/_types";
import * as automations from "./_module.mjs";

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
}
