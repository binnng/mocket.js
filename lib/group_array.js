var groupArray = function(arr, num, fill) {
	// arr = [] || num = 0
	if (!arr.length || !num) return arr;

	// 返回的数组
	var arr_back = [];
	// 数组的任一元素
	var item;
	// 数组的任一分组
	var column = [];
	function next(i) {
		if ((item = arr[i]) === undefined) return;

		column.push(item);

		// 最后一个元素
		if (i == arr.length-1) {
			// 用空串填满数组
			if (fill)
				while(column.length < num) column.push({pass: true});
			arr_back.push(column);
			return;
		}

		// 完成一个分组
		if (column.length == num) {
			arr_back.push(column);
			column = [];
		}

		next(++i);
	}
	next(0);
	return arr_back;
};