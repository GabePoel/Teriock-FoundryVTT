export default (Base) => {
  return class UseButtonSheetMixin extends Base {
    static DEFAULT_OPTIONS = {
      window: {
        controls: [
          {
            icon: "fa-solid fa-dice",
            label: "Use This",
            action: "rollThis",
          },
        ],
      },
    };
  };
};
