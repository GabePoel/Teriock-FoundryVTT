// noinspection JSUnusedGlobalSymbols

import { TeriockActiveEffect } from "../documents/_module.mjs";
import {
  AbilityExecution,
  ArmamentExecution,
} from "../executions/document-executions/_module.mjs";

declare global {
  namespace Teriock.HookData {
    export type BaseHookData = {
      cancel: boolean;
    };

    export type PostUpdate = Teriock.HookData.BaseHookData & {
      skipFunctions: Teriock.Parameters.Actor.SkipFunctions;
    };

    export type RollFeatSave = Teriock.HookData.BaseHookData & {
      attribute: Teriock.Parameters.Actor.Attribute;
      options: Teriock.Interaction.ThresholdOptions;
    };

    export type RollProtection = Teriock.HookData.BaseHookData & {
      options: Teriock.Interaction.ThresholdOptions;
    };

    export type RollTradecraft = Teriock.HookData.BaseHookData & {
      options: Teriock.Interaction.ThresholdOptions;
      tradecraft: Teriock.Parameters.Fluency.Tradecraft;
    };

    export type TakeNumeric = Teriock.HookData.BaseHookData & {
      amount: number;
    };

    export type TakePay = Teriock.HookData.BaseHookData & {
      amount: number;
      mode: Teriock.Parameters.Actor.PayMode;
    };

    export type TakeHack = Teriock.HookData.BaseHookData & {
      part: Teriock.Parameters.Actor.HackableBodyPart;
    };

    export type UseAbility = Teriock.HookData.BaseHookData & {
      execution: AbilityExecution;
    };

    export type UseArmament = Teriock.HookData.BaseHookData & {
      execution: ArmamentExecution;
    };

    export type DocActivity = Teriock.HookData.BaseHookData & {
      doc: TeriockChild;
    };

    export type DocDuplicate = Teriock.HookData.BaseHookData & {
      copy: TeriockChild;
      doc: TeriockChild;
    };

    export type EffectActivity = Teriock.HookData.BaseHookData & {
      doc: TeriockActiveEffect;
    };

    export type EquipmentActivity = Teriock.HookData.BaseHookData & {
      doc: TeriockEquipment;
    };

    export type EffectApplication = Teriock.HookData.BaseHookData & {
      docData: TeriockConsequence;
    };
  }
}
