/**
 * Convert unit name to a consistent standard.
 * @param {string} unit
 * @returns {string}
 */
export function standardizeLengthUnitName(unit) {
  const UNIT_ALIASES = {
    in: ["inch", "inches"],
    ft: ["foot", "feet"],
    yd: ["yard", "yards"],
    mi: ["mile", "miles"],
    mm: ["millimeter", "millimeters"],
    cm: ["centimeter", "centimeters"],
    dm: ["decimeter", "decimeters"],
    m: ["meter", "meters"],
    km: ["kilometer", "kilometers"],
  };
  for (const [key, value] of Object.entries(UNIT_ALIASES)) {
    if (value.includes(unit)) return key;
  }
  return unit;
}

/**
 * Convert the given unit to feet.
 * @param {number} range
 * @param {string} units
 * @returns {number}
 */
export function fromFeet(range, units) {
  switch (standardizeLengthUnitName(units)) {
    case "in":
      return range / 12;
    case "ft":
      return range;
    case "yd":
      return range * 3;
    case "mi":
      return range * 5280;
    case "mm":
      return (range * 10) / 3000;
    case "cm":
      return (range * 10) / 300;
    case "dm":
      return (range * 10) / 30;
    case "m":
      return (range * 10) / 3;
    case "km":
      return (range * 10000) / 3;
    default:
      return range;
  }
}

/**
 * Convert from feet to the given unit.
 * @param {number} range
 * @param {string} units
 * @returns {number}
 */
export function toFeet(range, units) {
  switch (standardizeLengthUnitName(units)) {
    case "in":
      return range * 12;
    case "ft":
      return range;
    case "yd":
      return range / 3;
    case "mi":
      return range / 5280;
    case "mm":
      return (range * 3000) / 10;
    case "cm":
      return (range * 300) / 10;
    case "dm":
      return (range * 30) / 10;
    case "m":
      return (range * 3) / 10;
    case "km":
      return (range * 3) / 10000;
    default:
      return range;
  }
}

/**
 * Convert between two units.
 * @param {number} range
 * @param {string} fromUnits
 * @param {string} toUnits
 * @returns {number}
 */
export function convertUnits(range, fromUnits, toUnits) {
  return toFeet(fromFeet(range, fromUnits), toUnits);
}

/**
 * Parses a duration string and returns a duration.
 * @param durationString
 * @returns {object}
 */
export function parseDurationString(durationString) {
  let parsingString = durationString.trim().toLowerCase().replace(/\.$/, "");
  let parsedUnit = "noLimit";
  let parsedQuantity = parseInt(parsingString) || 0;
  let parsedAbsentConditions = new Set();
  let parsedPresentConditions = new Set();
  // Handle special cases first
  if (parsingString.includes("while up")) {
    parsedAbsentConditions.add("down");
  }
  if (parsingString.includes("while alive")) {
    parsedAbsentConditions.add("dead");
  }
  if (parsingString.includes("instant")) {
    parsedUnit = "instant";
  }
  if (parsingString.includes("until dawn")) {
    parsedUnit = "untilDawn";
  }

  // General condition parsing
  for (const condition of Object.keys(TERIOCK.index.conditions)) {
    if (parsingString.includes("not " + condition)) {
      parsedAbsentConditions.add(condition);
    } else if (parsingString.includes(condition)) {
      parsedPresentConditions.add(condition);
    }
  }
  const parsedStationary = parsingString.includes("stationary");
  // Use word boundaries for unit matching to avoid partial matches
  for (const unit of Object.keys(TERIOCK.options.ability.duration.unit)) {
    const regex = new RegExp(`\\b${unit}s?\\b`);
    if (regex.test(parsingString)) {
      parsedUnit = unit;
      break;
    }
  }

  return {
    unit: parsedUnit,
    quantity: parsedQuantity,
    description: durationString,
    conditions: {
      absent: parsedAbsentConditions,
      present: parsedPresentConditions,
    },
    stationary: parsedStationary,
  };
}

/**
 * Converts a number of seconds to a human-readable time string.
 * @param {number} totalSeconds - The total number of seconds to convert.
 * @returns {string} A human-readable time string.
 */
export function secondsToReadable(totalSeconds) {
  if (totalSeconds < 0) {
    return "0 seconds";
  }
  const units = [
    {
      name: "year",
      seconds: 365.25 * 24 * 60 * 60,
    },
    {
      name: "week",
      seconds: 7 * 24 * 60 * 60,
    },
    {
      name: "day",
      seconds: 24 * 60 * 60,
    },
    {
      name: "hr",
      seconds: 60 * 60,
    },
    {
      name: "min",
      seconds: 60,
    },
    {
      name: "sec",
      seconds: 1,
    },
  ];
  const parts = [];
  let remaining = Math.floor(totalSeconds);
  for (const unit of units) {
    const count = Math.floor(remaining / unit.seconds);
    if (count > 0) {
      parts.push(`${count} ${unit.name}`);
      remaining -= count * unit.seconds;
    }
  }
  return parts.length > 0 ? parts.join(", ") : "0 sec";
}
/**
 * Round a value to the specified number of decimal places.
 * @param {number} value
 * @param {number} decimals
 * @returns {number}
 */
export function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
