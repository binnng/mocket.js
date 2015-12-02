var require, define;

(function(window) {
    var head = document.getElementsByTagName('head')[0];
    var loadingMap = {};
    var factoryMap = {};
    var modulesMap = {};
    var resMap;
    var pkgMap;
    var isStorageSupport = Store.isSupport;
    var comboSyntax = ["??", ","];
    var comboServe = "/combo";
    var storePrefix = "mocket-";
    var search = location.search || "";

    // 最大combo资源数，默认10个
    var maxComboNum = 10;

    // 屏蔽读取storage，便于开发
    // 1) window.ignoreStore = true
    // 2) URL中有ignoreStore
    var ignoreStore = window.ignoreStore || search.match(/ignoreStore/);
    var isClearStore = search.match(/clearStore/);

    // 执行代码片段
    function exec(s) {
        (new Function(s))();
    }

    // 获取存储的模块集合
    function getStores() {
        var stores = {};
        var storage = Store.get();
        for (var key in storage) {
            if (0 === key.indexOf(storePrefix)) {
                stores[key.substr(storePrefix.length)] = storage[key];
            }
        }
        return stores;
    }

    // 拼接combo的url
    function getComboURI(requires) {
        var start = comboSyntax[0]; // ??
        var sep = comboSyntax[1]; // ,

        return comboServe + start + requires.join(sep);
    }

    // 将执行中的define函数，以字符串形式输出存储
    function stringify(id, factory) {
        return "define('" + id + "'," + factory.toString() + ");";
    };

    // 通过静态资源id从resMap中获取实际url
    function getStaticURI(id) {
        var res = (resMap || {})[id] || {};
        return res['url'] || id;
    };

    function clearStore() {
        Store.clear(storePrefix);
    };

    define = function(id, factory) {
        factoryMap[id] = factory;

        var queue = loadingMap[id];
        if (queue) {
            for (var i = queue.length - 1; i >= 0; --i) {
                queue[i]();
            }
            delete loadingMap[id];
        }

        if (!isClearStore && isStorageSupport) {
            var storeId = storePrefix + getStaticURI(id);

            if (!Store(storeId)) {
                Store(storeId, stringify(id, factory));
            }
        }
    };

    require = function(id) {
        id = require.alias(id);

        var mod = modulesMap[id];
        if (mod) {
            return mod['exports'];
        }

        //
        // init module
        //
        var factory = factoryMap[id];
        if (!factory) {
            throw Error('Cannot find module `' + id + '`');
        }

        mod = modulesMap[id] = {
            'exports': {}
        };

        //
        // factory: function OR value
        //
        var ret = (typeof factory == 'function') ? factory.apply(mod, [require, mod['exports'], mod]) : factory;

        if (ret) {
            mod['exports'] = ret;
        }
        return mod['exports'];
    };

    require.async = function(names, callback) {
        if (typeof names == 'string') {
            names = [names];
        }

        for (var i = names.length - 1; i >= 0; --i) {
            names[i] = require.alias(names[i]);
        }

        var needMap = {};
        var needURLMap = [];
        var stores = getStores();
        var needLoad = [];
        var needNum = 0;
        var hasStored = [];
        var aioFile = resMap.aio && resMap.aio.url;

        findNeed(names);
        updateStore();

        if (hasStored.length) {
            // 保险延迟
            setTimeout(function() {
                hasStored.forEach(function(i) {
                    exec(stores[i]);
                })
            }, 0);
        }

        // 没有任何存储，并且配置了aio时，加载aio文件
        if (!hasStored.length && aioFile) {
            loadScript(aioFile, next);
        // 继续走combo
        } else {
            if (needLoad.length) {
                groupNeed();
            } else {
                setTimeout(next, 1);
            }
        }

        function findNeed(depArr) {
            for (var i = depArr.length - 1; i >= 0; --i) {
                //
                // skip loading or loaded
                //
                var dep = depArr[i];
                var url = getStaticURI(dep);
                if (dep in factoryMap || dep in needMap) {
                    continue;
                }

                needMap[dep] = true;
                needURLMap.push(url);

                var child = resMap[dep];
                if (child && child.deps) {
                    findNeed(child.deps);
                }
            }
        }

        function updateStore() {
            needURLMap.forEach(function(item) {
                if (!ignoreStore && (item in stores)) {
                    hasStored.push(item);
                } else {
                    needLoad.push(item);
                }
            });
        }

        function updateNeed() {
            if (0 == --needNum) {
                next();
            }
        }

        function groupNeed() {
            var group = groupArray(needLoad, maxComboNum);
            var files;
            for(var i = group.length - 1; i >= 0; --i) {
                needNum++;
                files = group[i];
                loadScript(files.length > 1 ? getComboURI(files) : files[0], updateNeed);
            }
        }

        // 按顺序传递参数执行
        function next() {
            var modules = [];
            names.forEach(function(item) {
                modules.push(require(item));
            });
            callback.apply(window, modules);
        }

    };

    require.resourceMap = function(obj) {
        resMap = obj['res'] || {};
        pkgMap = obj['pkg'] || {};
    };

    require.alias = function(id) {
        return id;
    };

    require.config = function(data) {
        data.comboSyntax && (comboSyntax = data.comboSyntax);
        data.comboServe && (comboServe = data.comboServe);
        /boolean/i.test(typeof data.ignoreStore) && (ignoreStore = data.ignoreStore);
        data.maxComboNum && (maxComboNum = data.maxComboNum);
    };

    define.amd = {
        'jQuery': true,
        'version': '1.0.0'
    };

    if (isClearStore) {
        clearStore();
    }

    window.require = require;
    window.define = define;

})(window);