export default (Base) => {
  return class WikiButtonSheetMixin extends Base {
    static DEFAULT_OPTIONS = {
      window: {
        controls: [
          {
            icon: "fa-solid fa-globe",
            label: "View on Wiki",
            action: "wikiOpenThis",
          },
          {
            icon: "fa-solid fa-arrow-down-to-line",
            label: "Pull from Wiki",
            action: "wikiPullThis",
          },
        ],
      },
    };
  };
};
