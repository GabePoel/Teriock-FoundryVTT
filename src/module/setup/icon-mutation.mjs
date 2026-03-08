/**
 * Mutate an icon to add Material Symbols from its class.
 * @param {HTMLElement} icon
 */
export function mutateIcon(icon) {
  for (let i = 0; i < icon.classList.length; i++) {
    const className = icon.classList[i];
    if (className.startsWith("ms-")) {
      const iconName = className.substring(3);
      if (icon.textContent !== iconName) {
        icon.textContent = iconName;
        icon.classList.add("mic");
      }
      break;
    }
  }
}
