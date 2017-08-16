<template>
    <div :class="classes" @mousemove="handleMouseMove">
        <div @click="handleClick(cell)" :class=getCellCls(cell) v-for="(cell, index) in cells" style='line-height: 24px;' class='one-week'><span style='width: 50px;padding-left: 10px'>第{{cell.count}}周</span><span style='width: 145px'>{{cell.firstDayOfWeek}}~{{cell.endDayOfWeek}}</span></div>
    </div>
</template>
<script>
    import { getFirstDayOfMonth, getDayCountOfMonth } from '../util';
    import { deepCopy } from '../../../utils/assist';
    import Locale from '../../../mixins/locale';
    import moment from 'moment';
    moment.locale('zh-cn');

    const prefixCls = 'ivu-date-picker-cells';

    const clearHours = function (time) {
        const cloneDate = new Date(time);
        cloneDate.setHours(0, 0, 0, 0);
        return cloneDate.getTime();
    };

    export default {
        mixins: [ Locale ],
        props: {
            date: {},
            year: {},
            month: {},
            selectionMode: {
                default: 'week'
            },
            disabledDate: {},
            minDate: {},
            maxDate: {},
            rangeState: {
                default () {
                    return {
                        endDate: null,
                        selecting: false
                    };
                }
            },
            value: ''
        },
        data () {
            return {
                prefixCls: prefixCls,
            };
        },
        watch: {
            'rangeState.endDate' (newVal) {
                this.markRange(newVal);
            },
            minDate(newVal, oldVal) {
                if (newVal && !oldVal) {
                    this.rangeState.selecting = true;
                    this.markRange(newVal);
                } else if (!newVal) {
                    this.rangeState.selecting = false;
                    this.markRange(newVal);
                } else {
                    this.markRange();
                }
            },
            maxDate(newVal, oldVal) {
                if (newVal && !oldVal) {
                    this.rangeState.selecting = false;
                    this.markRange(newVal);
                }
            },
        },
        computed: {
            classes () {
                return [
                    `${prefixCls}`
                ];
            },
            cells () {
                let cellsArray=[];
                const date = new Date(this.year, this.month, 1);
                var firstDay = moment(date,'YYYY-MM-DD').startOf('month'),//这个月的第一天
                    monthDay = getFirstDayOfMonth(date),//这个月的第一天在当前周的第几天
                    month = firstDay.format('MM'),//当前月份
                    week,count = 1, nowDate;
                //今天的日期或者是指定的value值
                if(this.value){
                    let valArr=this.value.split('~');
                    nowDate=clearHours(new Date(valArr[0]));
                }else{
                    nowDate=clearHours(new Date());
                }
                if(monthDay != "1"){
                    week = moment(firstDay.format('YYYY-MM-DD'),'YYYY-MM-DD').add('day',7-monthDay+1);
                    console.log(week);
                }else{
                    week = moment(firstDay.format('YYYY-MM-DD'),'YYYY-MM-DD');
                    console.log(week);
                }
                //循环本月的几个周
                while(week.startOf('week').format('MM') == month){
                    var cell={};
                    cell.count=count;
                    cell.firstDayOfWeek=week.startOf('week').format('YYYY-MM-DD');
                    cell.endDayOfWeek=week.endOf('week').format('YYYY-MM-DD');
                    //
                    if(nowDate==clearHours(cell.endDayOfWeek)||nowDate==clearHours(cell.firstDayOfWeek)||nowDate>clearHours(cell.firstDayOfWeek)&&nowDate<clearHours(cell.endDayOfWeek)){
                        cell.selected=true;
                    }else{
                        cell.selected=false;
                    }
                    week = week.add('day',7);
                    cellsArray.push(cell);
                    count++;
                }
                return cellsArray;
            }
        },
        methods: {
            getDateOfCell (cell) {
                let year = this.year;
                let month = this.month;
                let day = cell.text;

                const date = this.date;
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();

                if (cell.type === 'prev-month') {
                    if (month === 0) {
                        month = 11;
                        year--;
                    } else {
                        month--;
                    }
                } else if (cell.type === 'next-month') {
                    if (month === 11) {
                        month = 0;
                        year++;
                    } else {
                        month++;
                    }
                }
                let weekTest=new Date(year, month, day, hours, minutes, seconds).getDay();
//                console.log('8.14---week---'+new Date(year, month, day, hours, minutes, seconds)+weekTest);
                return new Date(year, month, day, hours, minutes, seconds);
            },
            handleClick (cell) {
                const target = event.target;
                if (target.tagName === 'SPAN') {
                    cell.selected=true;
                    //把选中的周传给week.vue
                    this.$emit('on-pick', cell.firstDayOfWeek+'~'+cell.endDayOfWeek);
                }
                this.$emit('on-pick-click');
            },
            handleMouseMove (event) {
                if (!this.rangeState.selecting) return;

                this.$emit('on-changerange', {
                    minDate: this.minDate,
                    maxDate: this.maxDate,
                    rangeState: this.rangeState
                });

                const target = event.target;
                if (target.tagName === 'EM') {
                    const cell = this.cells[parseInt(event.target.getAttribute('index'))];
//                    if (cell.disabled) return;    // todo 待确定
                    this.rangeState.endDate = this.getDateOfCell(cell);
                }
            },
            markRange (maxDate) {
//                console.log('date-table.vue:markRange');
                const minDate = this.minDate;
                if (!maxDate) maxDate = this.maxDate;

                const minDay = clearHours(new Date(minDate));
                const maxDay = clearHours(new Date(maxDate));

                this.cells.forEach(cell => {
                    if (cell.type === 'today' || cell.type === 'normal') {
                        const time = clearHours(new Date(this.year, this.month, cell.text));
                        cell.range = time >= minDay && time <= maxDay;
                        cell.start = minDate && time === minDay;
                        cell.end = maxDate && time === maxDay;
                    }
                });
            },
            getCellCls (cell) {
                console.log('week-table---getCellCls'+cell);
                return [
                    {
                        [`one-week-selected`]: cell.selected
                    }
                ];
            }
        }
    };
</script>
<style>
    .one-week{
        border-radius: 3px;
    }
    .one-week:hover{
        background: #e1f0fe;
        cursor: pointer;
    }
    .one-week-selected{
        background:#2d8cf0;
        color:#fff;
    }
</style>
