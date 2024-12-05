import moment from "moment";

export const getDays = () => {
  const nextSevenDays = [];
  
  for (let i = 0; i < 7; i++) {
    const date = moment().add(i, "days");

    nextSevenDays.push({
      date: date.format("YYYY-MM-DD"),
      day: date.format("ddd"), //Tue, Mon
      formmatedDate: date.format("D"),
    });
  }

  return nextSevenDays;
};

export const getTime = () => {
  const timeList = [];

  for (let i = 0; i <= 23; i++) {
    timeList.push({
      time: `${i}:00`,
    });
  }

  return timeList;
};
