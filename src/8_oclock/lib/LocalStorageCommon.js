'use strict';

const NIGHT_MARKET_LOCALSTORAGE_NAME = 'bbt_night_market_data';

const LocalStorageCommon = {
    /**
     * 获取用户完成任务有没有弹过窗
     */
    hasGetTicket: function(userId, taskId) {
        const bbt_night_market_data = JSON.parse(window.localStorage.getItem(NIGHT_MARKET_LOCALSTORAGE_NAME));
        if (bbt_night_market_data) {
            return bbt_night_market_data[userId + '_' + taskId];
        } else {
            return false;
        }
    },
    
    saveGetTicket: function(userId, taskId) {
        let bbt_night_market_data = JSON.parse(window.localStorage.getItem(NIGHT_MARKET_LOCALSTORAGE_NAME));
        if (!bbt_night_market_data) {
            bbt_night_market_data = {};
        }
        bbt_night_market_data[userId + '_' + taskId] = true;
        window.localStorage.setItem(NIGHT_MARKET_LOCALSTORAGE_NAME, JSON.stringify(bbt_night_market_data));
    }
};

export default LocalStorageCommon;