const moment = require("moment");

/**
 *
 * @param {moment} now
 * @param {moment} lastCommand
 * @param {number} interval
 */

function timeDiff(now, lastCommand, interval = 15) {
  return now.diff(lastCommand, "seconds") >= interval;
}

module.exports = { timeDiff };
