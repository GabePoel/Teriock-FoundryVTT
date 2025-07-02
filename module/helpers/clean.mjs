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
 * Cleans a distance measurement string by removing common synonyms and standardizing format.
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
