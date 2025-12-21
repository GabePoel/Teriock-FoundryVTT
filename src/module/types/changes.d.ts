import { TeriockEffect } from "../documents/_module.mjs";
import { change } from "../constants/options/_module.mjs";

declare global {
  namespace Teriock.Changes {
    export type ChangeTime = keyof typeof change.time;

    export type ChangeTarget =
      | Teriock.Documents.CommonType
      | "Actor"
      | "Item"
      | "ActiveEffect"
      | "parent";

    export type PreparedChangeData = Teriock.Foundry.EffectChangeData & {
      qualifier: string;
      effect: TeriockEffect;
    };

    export type QualifiedChangeData = Teriock.Foundry.EffectChangeData & {
      qualifier: string;
      target: ChangeTarget;
      time: ChangeTime;
    };

    export type PartialChangeTypeTree<keys extends string> = {
      uuids: Record<UUID<TeriockParent>, PreparedChangeData[]>;
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
