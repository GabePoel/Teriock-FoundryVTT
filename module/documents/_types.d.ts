import "./mixins/_types";
import { ActorData, ActiveEffectData, ItemData, TokenData } from "@common/documents/_types.mjs";
import Collection from "@common/utils/collection.mjs";
import { actor as actorModels, effect as effectModels, item as itemModels } from "../data/_module.mjs";

type ActorModel = (typeof actorModels)[keyof typeof actorModels];
type EffectModel = (typeof effectModels)[keyof typeof effectModels];
type ItemModel = (typeof itemModels)[keyof typeof itemModels];

declare module "@client/documents/_module.mjs" {
  interface TeriockActor extends ActorData {
    type: ActorModel["metadata"]["type"];
    system: InstanceType<ActorModel>;
    items: Collection<string, TeriockItem>;
    effects: Collection<string, TeriockEffect>;
  }

  interface TeriockItem extends ItemData {
    type: ItemModel["metadata"]["type"];
    system: InstanceType<ItemModel>;
    effects: Collection<string, TeriockEffect>;
  }

  interface TeriockEffect extends ActiveEffectData {
    type: EffectModel["metadata"]["type"];
    system: InstanceType<EffectModel>;
  }
  
  interface TeriockToken extends TokenData {
    actor: TeriockActor;
  }
}

declare module "./actor.mjs" {
  const TeriockActor: TeriockActor;
  export default TeriockActor;
}

declare module "./item.mjs" {
  const TeriockItem: TeriockItem;
  export default TeriockItem;
}

declare module "./effect.mjs" {
  const TeriockEffect: TeriockEffect;
  export default TeriockEffect;
}

declare module "./token.mjs" {
  const TeriockToken: TeriockToken;
  export default TeriockToken;
}