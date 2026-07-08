import { registerEnricher } from "../enrichment-helpers.mjs";
import { default as codeEnricher } from "./code-enricher.mjs";
import { default as commandEnricher } from "./command-enricher.mjs";
import { default as gpEnricher } from "./gp-enricher.mjs";
import { default as identifierEnricher } from "./identifier-enricher.mjs";
import { default as lookupEnricher } from "./lookup-enricher.mjs";
import { default as packEnricher } from "./pack-enricher.mjs";
import { default as timesEnricher } from "./times-enricher.mjs";
import { default as wikiEnricher } from "./wiki-enricher.mjs";

/**
 * Register all enrichers.
 */
export function registerEnrichers() {
  registerEnricher(codeEnricher);
  registerEnricher(commandEnricher);
  registerEnricher(gpEnricher);
  registerEnricher(identifierEnricher);
  registerEnricher(lookupEnricher);
  registerEnricher(packEnricher);
  registerEnricher(timesEnricher);
  registerEnricher(wikiEnricher);
}
