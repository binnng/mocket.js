define("modules/a.js", function(require, exports, module) {
    module.exports = {
    	init: function() {
    		console.log("a.js");
    	}
    };
});
define("modules/b.js", function(require, exports, module) {
    module.exports = {
    	init: function() {
    		console.log("b.js");
    	}
    };
});
define("modules/c.js", function(require, exports, module) {
    module.exports = {
        init: function() {
            console.log("c.js");
        }
    };
});