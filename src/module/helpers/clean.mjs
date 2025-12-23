/**
 * Cleans a value by removing plus signs and converting to integer.
 * @param {string|number} value - The value to clean.
 * @returns {string} The cleaned integer value.
 */
export function cleanValue(value) {
  if (typeof value !== "string") {
    if (value) {
      return `${value}`;
    } else {
      return "";
    }
  }
  value = value.replace("+", "").trim();
  value = value.replace("×", "*");
  value = value.replace("STR", "@str");
  return value;
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
