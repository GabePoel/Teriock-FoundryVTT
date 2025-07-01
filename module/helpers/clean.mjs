/**
 * Cleans a value by removing plus signs and converting to integer.
 * @param {string|number} value - The value to clean.
 * @returns {number} The cleaned integer value.
 */
export function cleanValue(value) {
  if (typeof value !== "string") return value;
  value = value.replace("+", "").trim();
  return parseInt(value, 10);
}

/**
 * Cleans a feet measurement string by removing common synonyms and standardizing format.
 * @param {string} feet - The feet measurement string to clean.
 * @returns {string} The cleaned feet measurement string.
 */
export function cleanFeet(feet) {
  const synonyms = ["foot", "feet", "ft", "ft."];
  synonyms.forEach((synonym) => {
    const regex = new RegExp(synonym, "gi");
    feet = feet.replace(regex, "");
  });
  feet = feet.trim();
  return feet;
}

/**
 * Cleans a pounds measurement string by standardizing to "lb" format.
 * @param {string} pounds - The pounds measurement string to clean.
 * @returns {string} The cleaned pounds measurement string in "lb" format.
 */
export function cleanPounds(pounds) {
  const synonyms = ["pound", "pounds"];
  synonyms.forEach((synonym) => {
    const regex = new RegExp(synonym, "gi");
    pounds = pounds.replace(regex, "lb");
  });
  pounds = pounds.replace(/\blb\.\b/gi, "lb");
  pounds = pounds.trim();
  if (/\d$/.test(pounds) && !pounds.endsWith("lb")) {
    pounds += " lb";
  }
  return pounds;
}

/**
 * Cleans a plus/minus value by standardizing the format.
 * @param {string} value - The value string to clean.
 * @returns {string} The cleaned value with proper plus/minus formatting.
 */
export function cleanPlusMinus(value) {
  value = value.replace("+", "").trim();
  const number = parseFloat(value);
  if (!isNaN(number) && number > 0) {
    value = `+${number}`;
  } else if (!isNaN(number)) {
    value = `${number}`;
  }
  return value;
}

/**
 * Cleans a mana points (MP) value by standardizing the format.
 * @param {string} value - The MP value string to clean.
 * @returns {string} The cleaned MP value in "MP" format.
 */
export function cleanMp(value) {
  const synonyms = ["mana"];
  synonyms.forEach((synonym) => {
    const regex = new RegExp(synonym, "gi");
    value = value.replace(regex, "mp");
  });
  value = value.replace(/\bmp(?!\.)\b/gi, "MP");
  value = value.trim();
  if (/\d$/.test(value) && !value.endsWith("MP")) {
    value += " MP";
  }
  return value;
}

/**
 * Cleans a hit points (HP) value by standardizing the format.
 * @param {string} value - The HP value string to clean.
 * @returns {string} The cleaned HP value in "HP" format.
 */
export function cleanHp(value) {
  const synonyms = ["health", "hits", "hit"];
  synonyms.forEach((synonym) => {
    const regex = new RegExp(synonym, "gi");
    value = value.replace(regex, "hp");
  });
  value = value.replace(/\bhp(?!\.)\b/gi, "HP");
  value = value.trim();
  if (/\d$/.test(value) && !value.endsWith("HP")) {
    value += " HP";
  }
  return value;
}

/**
 * Cleans an armor value (AV) by standardizing the format.
 * @param {string} value - The AV value string to clean.
 * @returns {string} The cleaned AV value in "AV" format.
 */
export function cleanAv(value) {
  const synonyms = ["armor value", "armor"];
  synonyms.forEach((synonym) => {
    const regex = new RegExp(synonym, "gi");
    value = value.replace(regex, "av");
  });
  value = value.replace(/\bav(?!\.)\b/gi, "AV");
  value = value.trim();
  if (/\d$/.test(value) && !value.endsWith("AV")) {
    value += " AV";
  }
  return value;
}

/**
 * Cleans a block value (BV) by standardizing the format.
 * @param {string} value - The BV value string to clean.
 * @returns {string} The cleaned BV value in "BV" format.
 */
export function cleanBv(value) {
  value = cleanPlusMinus(value);
  const synonyms = ["block value", "block"];
  synonyms.forEach((synonym) => {
    const regex = new RegExp(synonym, "gi");
    value = value.replace(regex, "bv");
  });
  value = value.replace(/\bbv(?!\.)\b/gi, "BV");
  value = value.trim();
  if (/\d$/.test(value) && !value.endsWith("BV")) {
    value += " BV";
  }
  return value;
}

/**
 * Cleans a strength requirement (STR) by standardizing the format.
 * @param {string} value - The STR value string to clean.
 * @returns {string} The cleaned STR value in "Min STR" format.
 */
export function cleanStr(value) {
  const synonyms = ["strength", "str"];
  synonyms.forEach((synonym) => {
    const regex = new RegExp(synonym, "gi");
    value = value.replace(regex, "str");
  });
  value = value.replace(/\bstr(?!\.)\b/gi, "STR");
  value = value.trim();
  if (/\d$/.test(value) && !value.endsWith("STR")) {
    value += " Min STR";
  }
  return value;
}

/**
 * Cleans a damage value by standardizing the format.
 * @param {string} value - The damage value string to clean.
 * @returns {string} The cleaned damage value in "Damage" format.
 */
export function cleanDamage(value) {
  const synonyms = ["dmg"];
  synonyms.forEach((synonym) => {
    const regex = new RegExp(synonym, "gi");
    value = value.replace(regex, "damage");
  });
  value = value.replace(/\bdamage(?!\.)\b/gi, "Damage");
  value = value.trim();
  if (/\d$/.test(value) && !value.endsWith("Damage")) {
    value += " Damage";
  }
  return value;
}

/**
 * Generic function to clean a value with a specific suffix and synonyms.
 * @param {string} value - The value string to clean.
 * @param {string} suffix - The suffix to standardize to.
 * @param {string[]} synonyms - Array of synonyms to replace with the suffix.
 * @returns {string} The cleaned value with the standardized suffix.
 */
export function cleanSuffix(value, suffix, synonyms) {
  synonyms.forEach((synonym) => {
    const regex = new RegExp(synonym, "gi");
    value = value.replace(regex, suffix);
  });
  value = value.replace(new RegExp(`\\b${suffix}(?!\\.)\\b`, "gi"), suffix.toUpperCase());
  value = value.trim();
  if (/\d$/.test(value) && !value.endsWith(suffix.toUpperCase())) {
    value += ` ${suffix.toUpperCase()}`;
  }
  return value;
}

/**
 * Cleans and standardizes capitalization in a string.
 * @param {string} value - The string to clean and capitalize.
 * @returns {string} The cleaned string with proper capitalization.
 */
export function cleanCapitalization(value) {
  const words = value.split(" ");
  const filteredWords = words.filter((word) => word.length > 0);
  const capitalizedWords = filteredWords.map((word) => {
    if (word.length > 2) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word.toLowerCase();
  });
  return capitalizedWords.join(" ");
}
