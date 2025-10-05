export default (Base) => {
  return class ChatButtonSheetMixin extends Base {
    static DEFAULT_OPTIONS = {
      window: {
        controls: [
          {
            icon: "fa-solid fa-comment",
            label: "Share in Chat",
            action: "chatThis",
          },
        ],
      },
    };
  };
};
