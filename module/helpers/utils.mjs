import TeriockRoll from "../documents/roll.mjs";

export function makeIcon(icon, style = 'solid') {
  return `<i class="fas fa-${style} fa-${icon}"></i>`;
}

export function toCamelCaseList(names) {
  return names.map(str =>
    str
      .toLowerCase()
      .replace(/[-\s]+(.)/g, (_, c) => c.toUpperCase())
  );
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
        </div>`
    });
  }
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