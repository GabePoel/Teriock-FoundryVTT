export function migrate(data) {
  const num = Number(data.range);
  data.range = isNaN(num) ? null : num;
  const effects = data.effects || [];
  for (let i = 0; i < effects.length; i++) {
    if (effects[i] === "truth") {
      effects[i] = "truthDetecting";
    } else if (effects[i] === "duelMod") {
      effects[i] = "duelModifying";
    }
  }
  data.effects = effects;
  return data;
}