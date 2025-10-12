/**
 * In the rare cases where subclassing doesn't work right, this can be used to transplant specific methods from a
 * subclass onto the original class.
 * @param {Function} Original
 * @param {Function} Subclass
 * @param {readonly string[]} names
 * @param {{ statics?: readonly string[] }} [options]
 */
export function transplantOverrides(
  Original,
  Subclass,
  names,
  { statics = [] } = {},
) {
  const originalDescriptors = Object.fromEntries(
    names.map((n) => [
      n,
      Object.getOwnPropertyDescriptor(Original.prototype, n),
    ]),
  );

  const Copy = Object.create(Object.getPrototypeOf(Original.prototype));
  for (const [k, d] of Object.entries(originalDescriptors)) {
    if (!d) {
      continue;
    }
    Object.defineProperty(Copy, k, {
      ...("value" in d
        ? {
            value: d.value,
            writable: true,
          }
        : {
            get: d.get,
            set: d.set,
          }),
      configurable: true,
      enumerable: false,
    });
  }
  Object.setPrototypeOf(Subclass.prototype, Copy);

  const normalizeDescriptor = (d) => {
    if ("value" in d) {
      d.writable = true;
      d.configurable = true;
      d.enumerable = false;
    } else {
      d.configurable = true;
      d.enumerable = false;
    }
    return d;
  };

  const transplant = {};
  for (const k of names) {
    if (k === "constructor") {
      continue;
    }
    const d = Object.getOwnPropertyDescriptor(Subclass.prototype, k);
    if (!d) {
      continue;
    }
    transplant[k] = normalizeDescriptor(d);
  }
  Object.defineProperties(Original.prototype, transplant);

  if (statics.length) {
    const staticDescriptors = {};
    for (const k of statics) {
      if (k === "prototype" || k === "name" || k === "length") {
        continue;
      }
      const d = Object.getOwnPropertyDescriptor(Subclass, k);
      if (!d) {
        continue;
      }
      staticDescriptors[k] = normalizeDescriptor(d);
    }
    Object.defineProperties(Original, staticDescriptors);
  }
}
