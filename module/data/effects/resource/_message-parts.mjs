export function _messageParts(resource) {
  const blocks = [
    {
      title: 'Description',
      text: resource.system.description,
    },
  ]
  return {
    bars: [],
    blocks: blocks,
  }
}