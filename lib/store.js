/**
* 对本地存贮对象的操作封装
*/


var localStorageName = "localStorage";

function isLocalStorageSupported() {
    try { 
      var supported = (localStorageName in window && window[localStorageName]);
      var name = "__store";
      if (supported) {
				localStorage.setItem(name, "");
				localStorage.removeItem(name);
				return supported;
      }
    }
    catch(err) {
    	return false;
   	}
}

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

Store.isSupport = isLocalStorageSupported();

Store.get = function() {
	if (Store.isSupport) {
		var _localStorage = window[localStorageName];
		Store.get = function() {
			return _localStorage;
		}
		return _localStorage;	
	} else {
		return false;
	}
};


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

window.Store = Store;

