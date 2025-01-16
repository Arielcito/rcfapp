import moment from "moment";

export const getDays = () => {
  console.log('Generando fechas...');
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const fullDate = date.toISOString().split('T')[0];
    const item = {
      day: date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
      date: date.getDate(),
      fullDate: fullDate,
      formmatedDate: date.getDate().toString(),
    };
    console.log('Fecha generada:', item);
    days.push(item);
  }

  return days;
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
