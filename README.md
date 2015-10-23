# mocket.js

扩展了`mod.js`，使得`mod.js`支持本地缓存js组件

## API
```javascript

require.async([
	"a.js",
	"b.js"
], function(a,b) {
	a.init();
	b.init();
})

```

```javascript
require.config({
	comboServe: "http://www.a.com/combo",
	comboSyntax: ["??", ","],

	// 是否从存储中读取，开发时置false
	readStore: false
});
```