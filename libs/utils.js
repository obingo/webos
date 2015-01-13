/**
 * 把日期时间转换为字符串.
 *
 * @param  {Date} date
 * @return  {String}
 */
exports.formatDate = function formatDate(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	return [
		date.getFullYear(), '年',
		date.getMonth() + 1, '月',
		date.getDate(), '日 ',
		hours < 10 ? '0' + hours : hours, ':',
		minutes < 10 ? '0' + minutes : minutes, ':',
		seconds < 10 ? '0' + seconds : seconds
	].join('');
};