// noinspection JSUnusedGlobalSymbols

import { TeriockEffect } from "../documents/_module.mjs";
import { AbilityRollConfig } from "../data/effect-data/ability-model/types/roll-config";
import {
  TeriockConsequence,
  TeriockEquipment,
} from "../documents/_documents.mjs";

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
      options: Teriock.RollOptions.CommonRoll;
    };

    export type RollProtection = Teriock.HookData.BaseHookData & {
      options: Teriock.RollOptions.CommonRoll;
    };

    export type RollTradecraft = Teriock.HookData.BaseHookData & {
      options: Teriock.RollOptions.CommonRoll;
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
      rollConfig: AbilityRollConfig;
    };

    export type DocActivity = Teriock.HookData.BaseHookData & {
      doc: TeriockChild;
    };

    export type DocDuplicate = Teriock.HookData.BaseHookData & {
      copy: TeriockChild;
      doc: TeriockChild;
    };

    export type EffectActivity = Teriock.HookData.BaseHookData & {
      doc: TeriockEffect;
    };

    export type EquipmentActivity = Teriock.HookData.BaseHookData & {
      doc: TeriockEquipment;
    };

    export type EffectApplication = Teriock.HookData.BaseHookData & {
      docData: TeriockConsequence;
    };
  }
}
