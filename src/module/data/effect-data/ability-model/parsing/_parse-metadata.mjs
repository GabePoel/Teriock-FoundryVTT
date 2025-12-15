import { deepMerge } from "../../../../helpers/utils.mjs";
import { extractMetadataFromElement } from "../../../shared/parsing/extract-metadata.mjs";
import { getBarElement } from "../../../shared/parsing/get-text.mjs";

/**
 * Parse metadata.
 * @param {HTMLElement} htmlElement
 * @param {AbilityImpactsData} impacts
 * @private
 * @todo Finish processing the metadata rather than just printing it to the console.
 */
export function _parseMetadata(htmlElement, impacts) {
  console.log(htmlElement);
  const elements = {
    proficient: getBarElement(htmlElement, "if-proficient"),
    fluent: getBarElement(htmlElement, "if-fluent"),
    heightened: getBarElement(htmlElement, "heightened"),
  };
  /** @type {Record<string, Record<string, DOMStringMap[]>>} */
  const allMetadata = {
    base: {},
    fluent: {},
    heightened: {},
    proficient: {},
  };
  for (const [key, element] of Object.entries(elements)) {
    if (element) {
      console.log(element);
      Object.assign(allMetadata[key], extractMetadataFromElement(element));
    }
  }
  const baseElements = [
    getBarElement(htmlElement, "on-critical-hit"),
    getBarElement(htmlElement, "on-hit"),
    getBarElement(htmlElement, "on-fail"),
    getBarElement(htmlElement, "on-save"),
    htmlElement.querySelector(".ability-overview-base"),
  ];
  console.log(baseElements);
  for (const element of baseElements) {
    if (element) {
      allMetadata.base = deepMerge(
        allMetadata.base,
        extractMetadataFromElement(element),
      );
    }
  }
  console.log(allMetadata);
  for (const [key, metadata] of Object.entries(allMetadata)) {
    const impact = /** @type {AbilityImpactData} */ impacts[key];
    const rollsMeta = metadata.roll;
    if (rollsMeta) {
      for (const rollMeta of rollsMeta) {
        impact.rolls[rollMeta.rollType] = rollMeta.fullRoll;
      }
    }
    const hacksMeta = metadata.hack;
    if (hacksMeta) {
      impact.hacks =
        /** @type {Teriock.Parameters.Actor.HackableBodyPart[]} */ hacksMeta.map(
          (m) => m.part,
        );
    }
    const conditionsMeta = metadata.condition;
    if (conditionsMeta) {
      impact.statuses = conditionsMeta.map((m) => m.condition);
    }
    const startConditionsMeta = metadata.startCondition;
    if (startConditionsMeta) {
      impact.startStatuses = startConditionsMeta.map((m) => m.condition);
    }
    const endConditionsMeta = metadata.endCondition;
    if (endConditionsMeta) {
      impact.endStatuses = endConditionsMeta.map((m) => m.condition);
    }
    const tradecraftsMeta = metadata.tradecraftCheck;
    if (tradecraftsMeta) {
      impact.checks = tradecraftsMeta.map((m) => m.tradecraftCheck);
    }
    const standardDamageMeta = metadata.standardDamage;
    if (standardDamageMeta) {
      impact.common.push("standardDamage");
    }
    const durationMeta = metadata.duration;
    if (durationMeta) {
      impact.duration = Number(durationMeta[0].seconds);
    }
  }
  console.log(impacts);
}
