import moment from "moment";

export const getDays = () => {
  const dates = [];
  const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const today = moment();

  for (let i = 0; i < 7; i++) {
    const date = moment().add(i, 'days');
    const dateObj = {
      date: date.format('YYYY-MM-DD'),
      day: days[date.day()],
      formmatedDate: date.format('DD'),
      fullDate: date.format('YYYY-MM-DD'),
      month: Number.parseInt(date.format('M'), 10),
      year: Number.parseInt(date.format('YYYY'), 10)
    };
    dates.push(dateObj);
  }

  return dates;
};

export const getTime = () => {
  const timeList = [];
  
  for (let i = 8; i <= 23; i++) {
    const hour = i.toString().padStart(2, '0');
    const timeSlot = {
      time: `${hour}:00`,
    };
    timeList.push(timeSlot);
  }

  return timeList;
}; 