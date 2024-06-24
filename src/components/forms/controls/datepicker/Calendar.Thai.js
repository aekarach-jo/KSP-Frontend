/* eslint-disable no-bitwise */
/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-const-assign */
const thai = {
  name: 'thai',
  startYear: 1,
  yearLength: 365,
  epoch: 1523097,
  century: 25,
  weekStartDayIndex: 1,
  getMonthLengths(isLeap) {
    return [31, !isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  },
  isLeap(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },
  getLeaps(currentYear) {
    if (currentYear === 0) return;

    const year = currentYear > 0 ? 1 : -1;

    const leaps = [];
    const condition = () => (currentYear > 0 ? year <= currentYear : currentYear <= year);
    const increase = () => (currentYear > 0 ? year++ : year--);

    while (condition()) {
      if (this.isLeap(year)) leaps.push(year);

      increase();
    }

    return leaps;
  },
  getDayOfYear({ year, month, day }) {
    const monthLengths = this.getMonthLengths(this.isLeap(year));

    for (let i = 0; i < month.index; i++) {
      day += monthLengths[i];
    }

    return day;
  },
  getAllDays(date) {
    const { year } = date;

    return this.yearLength * (year - 1) + this.leapsLength(year) + this.getDayOfYear(date);
  },
  leapsLength(year) {
    return (((year - 1) / 4) | 0) + (-((year - 1) / 100) | 0) + (((year - 1) / 400) | 0);
  },
  guessYear(days, currentYear) {
    const year = ~~(days / 365.24);

    return year + (currentYear > 0 ? 1 : -1);
  },
};

export default thai;
