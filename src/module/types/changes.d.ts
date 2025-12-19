import { TeriockEffect } from "../documents/_module.mjs";
import { change } from "../constants/options/_module.mjs";

declare global {
  namespace Teriock.Changes {
    export type ChangeTime = keyof typeof change.time;

    export type PreparedChangeData = Teriock.Foundry.EffectChangeData & {
      qualifier: string;
      effect: TeriockEffect;
    };

    export type QualifiedChangeData = Teriock.Foundry.EffectChangeData & {
      qualifier: string;
      target: Teriock.Documents.CommonType | "Actor" | "Item" | "ActiveEffect";
      time: ChangeTime;
    };

    export type PartialChangeTypeTree<keys extends string> = {
      typed: Record<keys, PreparedChangeData[]>;
      untyped: PreparedChangeData[];
    };

    export type PartialChangeDocumentTree = {
      Actor: PartialChangeTypeTree<Teriock.Documents.ActorType>;
      Item: PartialChangeTypeTree<Teriock.Documents.ItemType>;
      Effect: PartialChangeTypeTree<Teriock.Documents.EffectType>;
    };

    export type ChangeTree = Record<ChangeTime, PartialChangeDocumentTree>;
  }
}
