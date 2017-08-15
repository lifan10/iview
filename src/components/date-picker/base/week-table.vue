<template>
    <div :class="classes" @click="handleClick" @mousemove="handleMouseMove">
        <div v-for="(cell, index) in cells"><span style='width: 60px'>第{{cell.week}}周</span><span style='width: 136px'>{{cell.firstDayOfWeek}}~{{cell.endDayOfWeek}}</span></div>
        <!--<div :class="[prefixCls + '-header']">-->
            <!--<span>{{ t('i.datepicker.weeks.sun') }}</span><span>{{ t('i.datepicker.weeks.mon') }}</span><span>{{ t('i.datepicker.weeks.tue') }}</span><span>{{ t('i.datepicker.weeks.wed') }}</span><span>{{ t('i.datepicker.weeks.thu') }}</span><span>{{ t('i.datepicker.weeks.fri') }}</span><span>{{ t('i.datepicker.weeks.sat') }}</span>-->
        <!--</div>-->
        <!--<span :class="getCellCls(cell)" v-for="(cell, index) in readCells"><em :index="index" :indexOfWeek='cell.indexOfWeek'>{{ cell.text }}</em></span>-->
    </div>
</template>
<script>
    import { getFirstDayOfMonth, getDayCountOfMonth } from '../util';
    import { deepCopy } from '../../../utils/assist';
    import Locale from '../../../mixins/locale';
    import moment from 'moment';

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
                default: 'day'
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
                const date = new Date(this.year, this.month, 1);
                console.log('8.15 week-test '+this.year+'年' + this.month+'月'+date);
//                let day = getFirstDayOfMonth(date);    // day of first day
//                day = (day === 0 ? 7 : day);
//                const today = clearHours(new Date());    // timestamp of today
//                const selectDay = clearHours(new Date(this.value));    // timestamp of selected day
//                const minDay = clearHours(new Date(this.minDate));
//                const maxDay = clearHours(new Date(this.maxDate));
////                console.log('date-table.vue---cells():'+this.value);
//
//                const dateCountOfMonth = getDayCountOfMonth(date.getFullYear(), date.getMonth());
//                const dateCountOfLastMonth = getDayCountOfMonth(date.getFullYear(), (date.getMonth() === 0 ? 11 : date.getMonth() - 1));
//
//                const disabledDate = this.disabledDate;
                return [
                    {'week':'1','firstDayOfWeek':'2017-07-31','endDayOfWeek':'2017-08-06'},
                    {'week':'2','firstDayOfWeek':'2017-08-07','endDayOfWeek':'2017-08-13'},
                    {'week':'3','firstDayOfWeek':'2017-08-14','endDayOfWeek':'2017-08-20'},
                    {'week':'4','firstDayOfWeek':'2017-08-21','endDayOfWeek':'2017-08-27'},
                    {'week':'5','firstDayOfWeek':'2017-08-28','endDayOfWeek':'2017-09-03'},
                ]

//

//                return cells;
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
            handleClick (event) {
//                console.log('date-table.vue:handleClick');
                const target = event.target;
                if (target.tagName === 'EM') {
                    const cell = this.cells[parseInt(event.target.getAttribute('index'))];
                    if (cell.disabled) return;

                    const newDate = this.getDateOfCell(cell);

                    if (this.selectionMode === 'range') {
                        if (this.minDate && this.maxDate) {
                            const minDate = new Date(newDate.getTime());
                            const maxDate = null;
                            this.rangeState.selecting = true;
                            this.markRange(this.minDate);

                            this.$emit('on-pick', {minDate, maxDate}, false);
                        } else if (this.minDate && !this.maxDate) {
                            if (newDate >= this.minDate) {
                                const maxDate = new Date(newDate.getTime());
                                this.rangeState.selecting = false;

                                this.$emit('on-pick', {minDate: this.minDate, maxDate});
                            } else {
                                const minDate = new Date(newDate.getTime());

                                this.$emit('on-pick', {minDate, maxDate: this.maxDate}, false);
                            }
                        } else if (!this.minDate) {
                            const minDate = new Date(newDate.getTime());
                            this.rangeState.selecting = true;
                            this.markRange(this.minDate);
//                            console.log(this.cells);
                            this.$emit('on-pick', {minDate, maxDate: this.maxDate}, false);
                        }
                    } else {
                        this.$emit('on-pick', newDate);
                    }
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
//                console.log(cell);
                return [
                    `${prefixCls}-cell`,
                    {
                        [`${prefixCls}-cell-selected`]: cell.selected || cell.start || cell.end,
                        [`${prefixCls}-cell-disabled`]: cell.disabled,
                        [`${prefixCls}-cell-today`]: cell.type === 'today',
                        [`${prefixCls}-cell-prev-month`]: cell.type === 'prev-month',
                        [`${prefixCls}-cell-next-month`]: cell.type === 'next-month',
                        [`${prefixCls}-cell-range`]: cell.range && !cell.start && !cell.end
                    }
                ];
            },

        }
    };
</script>
<style scoped>
    span{
        width: 60px;
    }
</style>
