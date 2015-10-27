# Mocket.js

扩展了`mod.js`，使得`mod.js`支持本地缓存js组件

## 基于FIS
依赖[FIS](http://fis.baidu.com/)生成的静态资源Map，格式如下：
```javascript
require.resourceMap({
  "res": {
    "modules/a.js": {
      "url": "modules/a.13e18ud.js"
    },
    "modules/b.js": {
      "url": "modules/b.89d98ie.js"
    }
  }
});
```

## API

### require.async

使用`require.async`，让FIS生成`resourceMap`

```javascript
require.async([
	"modules/a.js",
	"modules/b.js"
], function(a,b) {
	a.init();
	b.init();
})

```
### require.config

配置项
```javascript
require.config({
	comboServe: "http://www.a.com/combo",
	comboSyntax: ["??", ","],

	// 是否从存储中读取，开发时置true
	ignoreStore: true,

	// 最大combo资源数
	maxComboNum: 50
});
```

### ignoreStore

有以下几种方式屏蔽读取localStorage，便于开发

* window.ignoreStore = true
* URL中存在参数ignoreStore


### clearStore

当URL中存在参数clearStore，可以删除localStorage
