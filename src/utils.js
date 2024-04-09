export const removeChartDataHelper = (data, id) => {
  if (!data) return;
  if (data.id === id) {
    return undefined;
  }
  let children = data?.children?.map((child) => removeChartDataHelper(child, id));
  children = children?.filter((child) => child !== undefined);

  return { ...data, children };
};
