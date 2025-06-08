export const genTimeName = () => {
  const curDate = new Date();
  const year = curDate.getFullYear();
  const month = (curDate.getMonth() + 1).toString().padStart(2, "0");
  const day = curDate.getDate().toString().padStart(2, "0");
  const hour = curDate.getHours().toString().padStart(2, "0");
  const minute = curDate.getMinutes().toString().padStart(2, "0");
  const second = curDate.getSeconds().toString().padStart(2, "0");
  return `${year}.${month}.${day} ${hour}:${minute}:${second}`;
};
