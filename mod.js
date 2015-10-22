var require, define;

(function(self) {
    var head = document.getElementsByTagName('head')[0];
    var loadingMap = {};
    var factoryMap = {};
    var modulesMap = {};
    var resMap;
    var pkgMap;
    var isStorageSupport = Store.isSupport;
    var comboSyntax = ["??", ","];
    var comboServe = "//qianbao.baidu.com/combo";
    var storePrefix = "mocket-";
    var comboStore = true;

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

    // 获取combo的url
    function getComboURI(requires) {
        var start = comboSyntax[0]; // ??
        var sep = comboSyntax[1]; // ,

        return comboServe + start + requires.join(sep);
    }

    // 将执行中的define函数，以字符串形式输出存储
    function stringify(id, factory) {
        return "define('" + id + "'," + factory.toString() + ");";
    };

    function getStaticURI(id) {
        var res = resMap[id] || {};
        var url;

        var pkgID = res['pkg'];
        if (pkgID) {
            url = pkgMap[pkgID]['url'];
        }
        else {
            url = res['url'] || id;
        }

        return url;
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

        if (isStorageSupport) {
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
        var needMapArr = [];
        var needURLMap = [];
        var needNum = 0;
        var stores = getStores();
        var needLoad = [];
        var hasStored = [];

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
                needMapArr.push(dep);
                needURLMap.push(url);
                needNum++;

                var child = resMap[dep];
                if (child && child.deps) {
                    findNeed(child.deps);
                }
            }
        }

        function updateNeed() {
            needURLMap.forEach(function(item) {
                if (comboStore && (item in stores)) {
                    hasStored.push(item);
                } else {
                    needLoad.push(item);
                }
            });
        }

        findNeed(names);
        updateNeed();

        // 保险延迟
        if (hasStored.length) {
            setTimeout(function() {
                hasStored.forEach(function(i) {
                    exec(stores[i]);
                })
            }, 0);
        }

        if (needLoad.length) {
            loadScript(getComboURI(needLoad), next);
        } else {
            setTimeout(next, 10);
        }

        // 按顺序传递参数执行
        function next() {
            var modules = [];
            needMapArr.forEach(function(item) {
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
        return id
    };

    require.config = function(data) {
        data.comboSyntax && (comboSyntax = data.comboSyntax);
        data.comboServe && (comboServe = data.comboServe);
        /boolean/i.test(typeof data.comboStore) && (comboStore = data.comboStore);
    };

    define.amd = {
        'jQuery': true,
        'version': '1.0.0'
    };

    window.require = require;
    window.define = define;

})(this);