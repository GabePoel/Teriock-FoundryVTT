import "./mixins/_types";
import { ActorData, ActiveEffectData, ItemData, TokenData } from "@common/documents/_types.mjs";
import Collection from "@common/utils/collection.mjs";
import { actor as actorModels, effect as effectModels, item as itemModels } from "../data/_module.mjs";
import type {
  TeriockActor as TeriockActorType,
  TeriockEffect as TeriockEffectType,
  TeriockItem as TeriockItemType,
  TeriockToken as TeriockTokenType,
} from "./_module.mjs";
import {
  TeriockAbility,
  TeriockCondition,
  TeriockEquipment,
  TeriockFluency,
  TeriockPower,
  TeriockProperty,
  TeriockRank,
  TeriockResource,
} from "../types/documents";

type ActorModel = (typeof actorModels)[keyof typeof actorModels];
type EffectModel = (typeof effectModels)[keyof typeof effectModels];
type ItemModel = (typeof itemModels)[keyof typeof itemModels];

interface ParentDocumentMixinInterface {
  validEffects: TeriockEffect[];
  itemTypes: {
    equipment?: TeriockEquipment[];
    power?: TeriockPower[];
    rank?: TeriockRank[];
  }
  effectTypes: {
    ability?: TeriockAbility[];
    attunement?: TeriockAttunement[];
    base?: TeriockEffect[];
    condition?: TeriockCondition[];
    effect?: TeriockEffect[];
    fluency?: TeriockFluency[];
    property?: TeriockProperty[];
    resource?: TeriockResource[];
  }
}

declare module "@client/documents/_module.mjs" {
  interface TeriockActor extends TeriockActorType, ActorData, ParentDocumentMixinInterface {
    type: ActorModel["metadata"]["type"];
    system: InstanceType<ActorModel>;
    items: Collection<string, TeriockItem>;
    effects: Collection<string, TeriockEffect>;
  }

  interface TeriockItem extends TeriockItemType, ItemData, ParentDocumentMixinInterface {
    type: ItemModel["metadata"]["type"];
    system: InstanceType<ItemModel>;
    effects: Collection<string, TeriockEffect>;
  }

  interface TeriockEffect extends TeriockEffectType, ActiveEffectData {
    type: EffectModel["metadata"]["type"];
    system: InstanceType<EffectModel>;
  }

  interface TeriockToken extends TeriockTokenType, TokenData {
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
