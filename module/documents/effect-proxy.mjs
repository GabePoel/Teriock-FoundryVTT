import createDocumentProxy from "./create-proxy.mjs";
import TeriockAbility from "./effects/ability.mjs";
import TeriockBaseEffect from "./effects/base.mjs";
import TeriockCondition from "./effects/condition.mjs";
import TeriockEffect from "./effects/effect.mjs";
import TeriockFluency from "./effects/fluency.mjs";
import TeriockProperty from "./effects/property.mjs";
import TeriockResource from "./effects/resource.mjs";

const typeMappings = {
  ability: TeriockAbility,
  base: TeriockBaseEffect,
  condition: TeriockCondition,
  effect: TeriockEffect,
  fluency: TeriockFluency,
  property: TeriockProperty,
  resource: TeriockResource,
}

const TeriockEffectProxy = createDocumentProxy(typeMappings, TeriockBaseEffect);
export default TeriockEffectProxy;