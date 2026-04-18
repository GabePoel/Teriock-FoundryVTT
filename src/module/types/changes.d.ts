import { TeriockActiveEffect } from "../documents/_module.mjs";
import { phase } from "../constants/config/change-config.mjs";
import { EffectChangeData } from "@common/documents/_types.mjs";

declare global {
  namespace Teriock.Changes {
    export type Phase = keyof typeof phase;

    export type Target =
      | Teriock.Documents.CommonType
      | "Actor"
      | "Item"
      | "ActiveEffect"
      | "parent";

    export type PreparedChangeData = EffectChangeData & {
      qualifier: string;
      effect: TeriockActiveEffect;
    };

    export type QualifiedChangeData = EffectChangeData & {
      qualifier: string;
      target: Target;
      time: Phase;
    };

    export type PartialChangeTypeTree<keys extends string> = {
      uuids: Record<UUID<ParentDocument>, PreparedChangeData[]>;
      typed: Record<keys, PreparedChangeData[]>;
      untyped: PreparedChangeData[];
    };

    export type PartialChangeDocumentTree = {
      Actor: PartialChangeTypeTree<Teriock.Documents.ActorType>;
      Item: PartialChangeTypeTree<Teriock.Documents.ItemType>;
      Effect: PartialChangeTypeTree<Teriock.Documents.EffectType>;
    };

    export type ChangeTree = Record<Phase, PartialChangeDocumentTree>;
  }
}
