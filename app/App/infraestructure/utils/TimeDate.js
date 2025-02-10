import moment from "moment";

export const getDays = () => {
  console.log('TimeDate - Iniciando getDays()');
  const days = [];
  const today = new Date();
  console.log('TimeDate - Fecha actual:', today);

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const item = {
      day: date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      formmatedDate: date.getDate().toString().padStart(2, '0'),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
    console.log(`TimeDate - Fecha generada para día ${i}:`, item);
    days.push(item);
  }

  console.log('TimeDate - Lista final de días:', days);
  return days;
};

export const getTime = () => {
  console.log('TimeDate - Iniciando getTime()');
  const timeList = [];
  
  for (let i = 8; i <= 23; i++) {
    const hour = i.toString().padStart(2, '0');
    const timeSlot = {
      time: `${hour}:00`,
    };
    console.log('TimeDate - Generando horario:', timeSlot);
    timeList.push(timeSlot);
    
    if (i < 23) {
      const halfHourSlot = {
        time: `${hour}:30`,
      };
      console.log('TimeDate - Generando horario media hora:', halfHourSlot);
      timeList.push(halfHourSlot);
    }
  }

  console.log('TimeDate - Lista final de horarios:', timeList);
  return timeList;
};
