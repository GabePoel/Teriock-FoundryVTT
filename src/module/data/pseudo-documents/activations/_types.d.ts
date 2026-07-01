import "./abstract/_types";
import * as activations from "./_module.mjs";

declare global {
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
}
