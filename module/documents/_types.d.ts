import "./mixins/_types";
import { ActiveEffectData, ActorData, ItemData, TokenData } from "@common/documents/_types.mjs";
import Collection from "@common/utils/collection.mjs";
import { actor as actorModels, effect as effectModels, item as itemModels } from "../data/_module.mjs";
import type { TeriockActor, TeriockEffect, TeriockItem } from "./_module.mjs";

type ActorModel = (typeof actorModels)[keyof typeof actorModels];
type EffectModel = (typeof effectModels)[keyof typeof effectModels];
type ItemModel = (typeof itemModels)[keyof typeof itemModels];

declare module "@client/documents/_module.mjs" {
  interface Actor<Model extends ActorModel = ActorModel> extends ActorData, ParentDocumentMixinInterface {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
    items: Collection<string, TeriockItem>;
    effects: Collection<string, TeriockEffect>;
  }

  interface Item<Model extends ItemModel = ItemModel> extends ItemData, ParentDocumentMixinInterface {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
    effects: Collection<string, TeriockEffect>;
    parent: TeriockActor;
  }

  interface ActiveEffect<Model extends EffectModel = EffectModel> extends ActiveEffectData {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
  }

  interface Token extends TokenData {
    actor: TeriockActor;
  }
}
