export const dateFormat = (date: Date) => {
  const t = (num: number) => ("0" + num).slice(-2);
  return `${date.getFullYear()}-${t(date.getMonth() + 1)}-${t(
    date.getDate()
  )} ${t(date.getHours())}:${t(date.getMinutes())}:${t(date.getSeconds())}`;
};
