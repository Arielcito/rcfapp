import moment from "moment";

export const getDays = () => {
  console.log('📅 [TIMEDATE] Generando próximos 7 días');
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
    console.log('TimeDate - Fecha generada:', JSON.stringify(dateObj));
    dates.push(dateObj);
  }

  console.log('📅 [TIMEDATE] Total días generados:', dates.length);
  return dates;
};

export const getTime = () => {
  console.log('⏰ [TIMEDATE] Generando horarios disponibles (8:00 - 23:00)');
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

  console.log('⏰ [TIMEDATE] Total horarios generados:', timeList.length);
  return timeList;
}; 