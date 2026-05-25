/**
 * @param {typeof DocumentDirectory} Base
 */
export default function SidebarMixin(Base) {
  return (
    /**
     * @extends {DocumentDirectory}
     * @mixin
     */
    class Sidebar extends Base {
      static _entryPartial = "teriock/sidebar/document-partial";
    }
  );
}
