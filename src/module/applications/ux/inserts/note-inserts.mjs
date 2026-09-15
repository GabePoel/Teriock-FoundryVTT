/** @type {ProseMirrorInsert} */
const noteInserts = {
  action: "teriock.notes",
  children: ["info", "error", "warning", "success", "morganti"].map(level => {
    return {
      action: `teriock.note-${level}`,
      html: `<aside class="notification ${level} theme-dark"><selection>Add text here.</selection></aside>`,
      title: `TERIOCK.COMMON.${level.capitalize()}`,
    };
  }),
  title: "TERIOCK.COMMON.Notes",
};

export default noteInserts;
