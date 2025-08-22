export default () =>
  useState<{ loading: boolean; id: number }>("loadingStore", () => {
    return {
      loading: false,
      id: 0,
    };
  });
