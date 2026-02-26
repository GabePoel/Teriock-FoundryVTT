import { abilityOptions } from "./ability-options.mjs";
import { attributeOptions } from "./attribute-options.mjs";
import { attunementOptions } from "./attunement-options.mjs";
import * as change from "./change-options.mjs";
import { characterOptions } from "./character-options.mjs";
import { consequenceOptions } from "./consequence-options.mjs";
import { currencyOptions } from "./currency-options.mjs";
import { deliveryOptions } from "./delivery-options.mjs";
import { dieOptions } from "./die-options.mjs";
import { displayOptions } from "./display-options.mjs";
import { documentOptions } from "./document-options.mjs";
import { effectOptions } from "./effect-options.mjs";
import { equipmentOptions } from "./equipment-options.mjs";
import { hackOptions } from "./hack-options.mjs";
import { indexOptions } from "./index-options.mjs";
import { powerOptions } from "./power-options.mjs";
import { rankOptions } from "./rank-options.mjs";
import { speciesOptions } from "./species-options.mjs";
import { takeOptions } from "./take-options.mjs";
import { targetOptions } from "./target-options.mjs";
import { tradecraftOptions } from "./tradecraft-options.mjs";

const options = {
  ability: abilityOptions,
  attribute: attributeOptions,
  attunement: attunementOptions,
  change,
  character: characterOptions,
  consequence: consequenceOptions,
  currency: currencyOptions,
  delivery: deliveryOptions,
  die: dieOptions,
  display: displayOptions,
  document: documentOptions,
  effect: effectOptions,
  equipment: equipmentOptions,
  hack: hackOptions,
  index: indexOptions,
  power: powerOptions,
  rank: rankOptions,
  species: speciesOptions,
  take: takeOptions,
  target: targetOptions,
  tradecraft: tradecraftOptions,
};

export default options;
