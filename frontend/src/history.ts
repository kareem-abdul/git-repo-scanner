export const History: any = {
    navigate: null,
    push: (page: any, ...rest: any) => History.navigate(page, ...rest),
  };
  