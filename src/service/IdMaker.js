'use strict';
/*
 * ID 生成器
 */
function* IdMaker (startID) {
    let id = startID || 1;
    while(true) yield id++;
}

export default IdMaker;