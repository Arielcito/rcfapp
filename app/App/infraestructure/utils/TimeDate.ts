export const getDays = () => {
  console.log('TimeDate - Generando fechas');
  const dates = [];
  const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const today = moment();

  for (let i = 0; i < 7; i++) {
    const date = moment().add(i, 'days');
    const dateObj = {
      date: date.format('YYYY-MM-DD'),
      day: days[date.day()],
      formmatedDate: date.format('DD'),
      month: date.month() + 1,
      year: date.year(),
      fullDate: date.format('YYYY-MM-DD')
    };
    console.log('TimeDate - Fecha generada:', dateObj);
    dates.push(dateObj);
  }

  return dates;
}; 