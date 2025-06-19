import TeriockRoll from "../documents/roll.mjs";

export function makeIcon(icon, style = "solid") {
  return `<i class="fas fa-${style} fa-${icon}"></i>`;
}

export function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[-\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toLowerCase());
}

export function toCamelCaseList(names) {
  return names.map((str) => toCamelCase(str));
}

export async function chatImage(img) {
  if (img) {
    await ChatMessage.create({
      content: `
        <div
          class="timage"
          data-src="${img}"
          style="display: flex; justify-content: center;"
        >
          <img src="${img}" class="teriock-image">
        </div>`,
    });
  }
}

export function abbreviate(string, length = 3) {
  return string.toLowerCase().slice(0, length);
}

export function evaluateSync(formula, data = {}, options = {}) {
  const roll = new TeriockRoll(formula, data);
  roll.evaluateSync(options);
  return roll.total;
}

export async function evaluateAsync(formula, data = {}, options = {}) {
  const roll = new TeriockRoll(formula, data);
  await roll.evaluate(options);
  return roll.result;
}

export function mergeLevel(obj, path, key) {
  const result = {};

  function getValueAtPath(object, pathArray) {
    return pathArray.reduce((current, segment) => {
      if (current === null || current === undefined) return undefined;
      return current[segment];
    }, object);
  }

  function processPath(object, pathSegments, currentIndex = 0) {
    if (currentIndex >= pathSegments.length) {
      if (key) {
        if (typeof object === "object" && object !== null) {
          if (key in object) {
            Object.assign(result, object[key]);
          } else {
            Object.keys(object).forEach((itemKey) => {
              if (object[itemKey] && typeof object[itemKey] === "object" && key in object[itemKey]) {
                result[itemKey] = object[itemKey][key];
              }
            });
          }
        }
      } else {
        Object.assign(result, object);
      }
      return;
    }

    const currentSegment = pathSegments[currentIndex];

    if (currentSegment === "*") {
      if (typeof object === "object" && object !== null) {
        Object.keys(object).forEach((objKey) => {
          processPath(object[objKey], pathSegments, currentIndex + 1);
        });
      }
    } else {
      if (object && typeof object === "object" && currentSegment in object) {
        processPath(object[currentSegment], pathSegments, currentIndex + 1);
      }
    }
  }

  const pathSegments = path.split(".");

  processPath(obj, pathSegments);

  return result;
}
