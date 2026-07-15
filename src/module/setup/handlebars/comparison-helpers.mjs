/**
 * Whether an iterable includes a certain element.
 * @template T
 * @param {Iterable<T>} list
 * @param {T} item
 * @returns {boolean}
 */
function includes(list, item) {
  return list ? Array.from(list).includes(item) : false;
}

export default { includes };
