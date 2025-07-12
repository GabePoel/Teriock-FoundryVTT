import "./mixins/_types";
import Collection from "@common/utils/collection.mjs";
import { TeriockActor, TeriockEffect, TeriockItem } from "./_module.mjs";
import { ParentDocumentMixinInterface } from "./mixins/_types";
import { actor as actorModels, effect as effectModels, item as itemModels } from "../data/_module.mjs";

type ActorModel = (typeof actorModels)[keyof typeof actorModels];
type EffectModel = (typeof effectModels)[keyof typeof effectModels];
type ItemModel = (typeof itemModels)[keyof typeof itemModels];

declare module "@client/documents/_module.mjs" {
  interface Actor<Model extends ActorModel = ActorModel>
    extends TeriockActor,
      MinimalGenericData,
      ParentDocumentMixinInterface {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
    items: Collection<string, TeriockItem>;
    effects: Collection<string, TeriockEffect>;
    statuses: Set<string>;
  }

  interface Item<Model extends ItemModel = ItemModel>
    extends TeriockItem,
      MinimalGenericData,
      ParentDocumentMixinInterface {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
    effects: Collection<string, TeriockEffect>;
    parent: TeriockActor;
  }

  interface ActiveEffect<Model extends EffectModel = EffectModel> extends TeriockEffect, MinimalGenericData {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
  }

  interface Token extends TokenData {
    actor: TeriockActor;
  }
}
