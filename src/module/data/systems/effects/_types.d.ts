import {
  AbilitySystem,
  AttunementSystem,
  BaseEffectSystem,
  ConditionSystem,
  ConsequenceSystem,
  FluencySystem,
  HackSystem,
  ImbuementSystem,
  PropertySystem,
  ResourceSystem,
} from "./_module.mjs";

declare global {
  export interface ActiveEffectSystemMap {
    ability: AbilitySystem;
    attunement: AttunementSystem;
    condition: ConditionSystem;
    consequence: ConsequenceSystem;
    cover: BaseEffectSystem;
    fluency: FluencySystem;
    hack: HackSystem;
    imbuement: ImbuementSystem;
    property: PropertySystem;
    resource: ResourceSystem;
  }

  export type ActiveEffectType = TypeMapKey<ActiveEffectSystemMap>;
}
