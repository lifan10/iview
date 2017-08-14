import dateUtil from '../../utils/date';

export const toDate = function(date) {
    date = new Date(date);
    if (isNaN(date.getTime())) return null;
    return date;
};

export const formatDate = function(date, format) {
    date = toDate(date);
    if (!date) return '';
    return dateUtil.format(date, format || 'yyyy-MM-dd');
};

export const parseDate = function(string, format) {
    return dateUtil.parse(string, format || 'yyyy-MM-dd');
};

export const getDayCountOfMonth = function(year, month) {
    if (month === 3 || month === 5 || month === 8 || month === 10) {
        return 30;
    }

    if (month === 1) {
        if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
            return 29;
        } else {
            return 28;
        }
    }

    return 31;
};

export const getFirstDayOfMonth = function(date) {
    const temp = new Date(date.getTime());
    temp.setDate(1);
    return temp.getDay();
};

export const prevMonth = function(src) {
    const year = src.getFullYear();
    const month = src.getMonth();
    const date = src.getDate();

    const newYear = month === 0 ? year - 1 : year;
    const newMonth = month === 0 ? 11 : month - 1;

    const newMonthDayCount = getDayCountOfMonth(newYear, newMonth);
    if (newMonthDayCount < date) {
        src.setDate(newMonthDayCount);
    }

    src.setMonth(newMonth);
    src.setFullYear(newYear);

    return new Date(src.getTime());
};

export const nextMonth = function(src) {
    const year = src.getFullYear();
    const month = src.getMonth();
    const date = src.getDate();

    const newYear = month === 11 ? year + 1 : year;
    const newMonth = month === 11 ? 0 : month + 1;

    const newMonthDayCount = getDayCountOfMonth(newYear, newMonth);
    if (newMonthDayCount < date) {
        src.setDate(newMonthDayCount);
    }

    src.setMonth(newMonth);
    src.setFullYear(newYear);

    return new Date(src.getTime());
};

export const initTimeDate = function () {
    const date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
};

export const initMonthDate = function () {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    date.setYear(year);
    date.setMonth(month);
    return date;
};

export const getWeek = function (date) {
    var totalDays = 0;
    let now = new Date(date);
    let years = now.getYear();
    if (years < 1000){
        years += 1900;
    }
    var days = new Array(12);
    days[0] = 31;
    days[2] = 31;
    days[3] = 30;
    days[4] = 31;
    days[5] = 30;
    days[6] = 31;
    days[7] = 31;
    days[8] = 30;
    days[9] = 31;
    days[10] = 30;
    days[11] = 31;

    //判断是否为闰年，针对2月的天数进行计算
    if (Math.round(now.getYear() / 4) == now.getYear() / 4) {
        days[1] = 29
    } else {
        days[1] = 28
    }
    if (now.getMonth() == 0) {
        totalDays = totalDays + now.getDate();
    } else {
        var curMonth = now.getMonth();
        for (var count = 1; count <= curMonth; count++) {
            totalDays = totalDays + days[count - 1];
        }
        totalDays = totalDays + now.getDate();
    }
    //得到第几周
    var week = Math.round(totalDays / 7);
    console.log(week);
};