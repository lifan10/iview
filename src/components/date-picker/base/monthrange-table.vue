<template>
    <div :class="classes" @click="handleClick" @mousemove="handleMouseMove">
        <span :class="getCellCls(cell)" v-for="(cell, index) in readCells"><em :index="index">{{ tCell(cell.text) }}</em></span>
    </div>
</template>
<script>
    import { deepCopy } from '../../../utils/assist';
    import Locale from '../../../mixins/locale';
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
            year:{},
            month: {
                type: Number
            },
            disabledDate: {},
            selectionMode: {
                default: 'month'
            },
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
                readCells: []
            };
        },
        computed: {
            classes () {
                return [
                    `${prefixCls}`,
                    `${prefixCls}-month`
                ];
            },
            cells () {
                let cells = [];
                const cell_tmpl = {
                    text: '',
                    type: '',
                    selected: false,
                    disabled: false,
                    range: false,
                    start: false,
                    end: false
                };

                for (let i = 0; i < 12; i++) {
                    const cell = deepCopy(cell_tmpl);
                    cell.text = i + 1;

                    const date = new Date(this.date);
                    date.setMonth(i);
                    cell.disabled = typeof this.disabledDate === 'function' && this.disabledDate(date)  && this.selectionMode === 'month';

                    cell.selected = Number(this.month) === i;
                    cells.push(cell);
                }

                return cells;
            }
        },
        watch:{
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
//                    this.$emit('on-pick', {
//                        minDate: this.minDate,
//                        maxDate: this.maxDate
//                    });
                }
            },
            cells: {
                handler (cells) {
                    this.readCells = cells;
                },
                immediate: true
            }
        },
        methods: {
            getCellCls (cell) {
                console.log(cell);
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
            handleClick (event) {
                const target = event.target;
                console.log('monthrange-table.vue:handleClick');
                if (target.tagName === 'EM') {
                    const index = parseInt(event.target.getAttribute('index'));
                    const cell = this.cells[index];
                    if (cell.disabled) return;

                    const newDate = this.getDateOfCell(cell);
                    console.log(newDate);

                    if(this.selectionMode=='range'){
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

                            this.$emit('on-pick', {minDate, maxDate: this.maxDate}, false);
                        }
                    }else {
                        this.$emit('on-pick', newDate);
                    }
                }
                this.$emit('on-pick-click');
            },
            getDateOfCell (cell) {
                let year = this.year;
                let month = cell.text==0?0:cell.text-1;
                let day = '01';

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

                return new Date(year, month, day, hours, minutes, seconds);
            },
            markRange (maxDate) {
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
            tCell (cell) {
                return this.t(`i.datepicker.months.m${cell}`);
            }
        }
    };
</script>
