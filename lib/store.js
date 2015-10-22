/**
* 对本地存贮对象的操作封装
*/


var Store = function(key, value) {
	var storage = Store.get();
	if (storage) {
		if ('undefined' === typeof value) {
			return storage.getItem(key);
		} else {
			storage.setItem(key, value);
		}
	}
};

Store.get = function() {
	var _localStorage;
	try{
		/* 在Android 4.0下，如果webview没有打开localStorage支持，在读取localStorage对象的时候会导致js运行出错，所以要放在try{}catch{}中 */
		_localStorage = window['localStorage'];
	} catch(e){
		console.log('localStorage is not supported');
	}
	Store.get = function() {
		return window['localStorage'];
	}
	return _localStorage;	
};

Store.isSupport = !!Store.get();

/**
 * 清除本地存贮数据
 * @param {String} prefix 可选，如果包含此参数，则只删除包含此前缀的项，否则清除全部缓存
 */
Store.clear = function(prefix) {
	var storage = Store.get();
	if (storage) {
		if (prefix) {
			for (var key in storage) {
				if (0 === key.indexOf(prefix)) {
					storage.removeItem(key);
				}
			}
		} else {
			storage.clear();
		}
	}
};

// 如果不支持Storage返回null
window.Store = Store;

