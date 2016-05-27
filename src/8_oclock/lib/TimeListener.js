'use strict';
class TimeListener {
    
    constructor(option) {
        const defaults = {
            start_time: 0,
            end_time: 0,
            time_now: 0
        };
        let _option = Object.assign({}, defaults, option);
        _option.start_time = _option.start_time.toString().length <=11 ? _option.start_time * 1000 : _option.start_time;
        _option.end_time = _option.end_time.toString().length <=11 ? _option.end_time * 1000 : _option.end_time;
        _option.time_now = _option.time_now.toString().length <=11 ? _option.time_now * 1000: _option.time_now;
        this.option = _option;
        this.timeState = this._init();
    }
    
    _init() {
        const _option = this.option;
        if (!_option.start_time || !_option.end_time || !_option.time_now) {
            console.log('起止时间有误，监听失败!');
            return -1;
        }
        const serverTimestamp = _option.time_now,
              clientTimestemp = new Date().getTime();
        this.correctedValue = clientTimestemp - serverTimestamp;
        console.log('与服务器存在时间差：' + this.correctedValue + 'ms');
        /*
         * 当前时间状态的判断
         */
        const fixed_now_timestamp = new Date(new Date().getTime() - this.correctedValue).getTime();
        let _timeState = 0;
        //今天的24时时间戳
        this._24oclock = Math.ceil(fixed_now_timestamp / (3600 * 24 * 1000)) * (3600 * 24 * 1000) - 8 * 3600 * 1000;
        if (fixed_now_timestamp < _option.start_time) {
            _timeState = 0;
        } else if (fixed_now_timestamp < _option.end_time) {
            _timeState = 1;
        } else {
            _timeState = 2;
        }
        return _timeState;
    }
    
    /**
     * 时间关键点的监控方法
     * 从未开始到开始的方法 toStartFn
     * 从开始到结束的方法 toEndFn
     * 从结束到第二次活动开始的方法 toFreshFn
     * 计时方法 timingFn
     */
    listener(callbackFn) {
        const _option = this.option;
        this.timeIndex = setInterval(() => {
            const fixed_now_timestamp = new Date(new Date().getTime() - this.correctedValue).getTime(),
                remainingTime = _option.start_time - fixed_now_timestamp;
            this._remainingTime = remainingTime;
            //时间状态
            if (this.timeState === 0 && (fixed_now_timestamp > _option.start_time)) {
                this.timeState = 1;
                callbackFn.toStartFn && callbackFn.toStartFn();
                console.log('任务开始了！');
            } else if (this.timeState === 1 && (fixed_now_timestamp > _option.end_time)) {
                this.timeState = 2;
                callbackFn.toEndFn && callbackFn.toEndFn();
                console.log('任务结束了！');
            } else if (this.timeState === 2 && (fixed_now_timestamp > this._24oclock)) {
                this.timeState = 0;
                callbackFn.toFreshFn && callbackFn.toFreshFn();
                console.log('任务到第二天刷新了！');
            } else {
                // console.log('任务还就这样了！');
            }
            callbackFn.timingFn && callbackFn.timingFn();
        }, 1000);
    }
    
    getState() {
        return this.timeState;
    }
    
    stopListener() {
        return clearInterval(this.timeIndex);
    }
}

export default TimeListener;