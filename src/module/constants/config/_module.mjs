import { abilityConfig } from "./ability-config.mjs";
import { attributeConfig } from "./attribute-config.mjs";
import { attunementConfig } from "./attunement-config.mjs";
import { default as changeConfig } from "./change-config.mjs";
import * as characterConfig from "./character-config.mjs";
import { default as classConfig } from "./class-config.mjs";
import { competenceConfig } from "./competence-config.mjs";
import { consequenceConfig } from "./consequence-config.mjs";
import { costConfig } from "./cost-config.mjs";
import { currencyConfig } from "./currency-config.mjs";
import { deliveryConfig } from "./delivery-config.mjs";
import { dieConfig } from "./die-config.mjs";
import { displayConfig } from "./display-config.mjs";
import { documentConfig } from "./document-config.mjs";
import { effectConfig } from "./effect-config.mjs";
import { equipmentConfig } from "./equipment-config.mjs";
import { hackConfig } from "./hack-config.mjs";
import { illusionConfig } from "./illusion-config.mjs";
import { impactConfig } from "./impact-config.mjs";
import { indexConfig } from "./index-config.mjs";
import { piercingConfig } from "./piercing-config.mjs";
import { powerConfig } from "./power-config.mjs";
import { protectionConfig } from "./protection-config.mjs";
import { scalingConfig } from "./scaling-config.mjs";
import { targetConfig } from "./target-config.mjs";
import { default as tradecraftConfig } from "./tradecraft-config.mjs";
import { transformationConfig } from "./transformation-config.mjs";
import { default as trigger } from "./trigger-config.mjs";
import { wikiConfig } from "./wiki-config.mjs";

const config = {
  ability: abilityConfig,
  attribute: attributeConfig,
  attunement: attunementConfig,
  change: changeConfig,
  character: characterConfig,
  class: classConfig,
  competence: competenceConfig,
  consequence: consequenceConfig,
  cost: costConfig,
  currency: currencyConfig,
  delivery: deliveryConfig,
  die: dieConfig,
  display: displayConfig,
  document: documentConfig,
  effect: effectConfig,
  equipment: equipmentConfig,
  hack: hackConfig,
  illusion: illusionConfig,
  impact: impactConfig,
  index: indexConfig,
  piercing: piercingConfig,
  power: powerConfig,
  protection: protectionConfig,
  scaling: scalingConfig,
  target: targetConfig,
  tradecraft: tradecraftConfig,
  transformation: transformationConfig,
  trigger,
  wiki: wikiConfig,
};

export default config;
