export function _prepareSize(actor) {
  const size = actor.system.size;
  const namedSizes = {
    0: 'Tiny',
    1: 'Small',
    3: 'Medium',
    5: 'Large',
    10: 'Huge',
    15: 'Gargantuan',
    20: 'Colossal',
  }
  const sizeKeys = Object.keys(namedSizes).map(Number);
  const filteredSizeKeys = sizeKeys.filter(key => key <= size);
  const sizeKey = Math.max(...filteredSizeKeys, 0);
  const namedSize = namedSizes[sizeKey] || 'Medium';
  actor.system.namedSize = namedSize;
}

export function _prepareVision(actor) {
  if (actor.isOwner) {
    const tokens = actor?.getDependentTokens() || [];
    for (const token of tokens) {
      token?.updateVisionMode(actor?.statuses?.has('ethereal') ? 'ethereal' : 'basic');
    }
  }
}