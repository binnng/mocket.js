var gulp = require('gulp');
var wrapJs = require("gulp-wrap-js");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");

gulp.task("build", function() {
	gulp.src([
		"lib/es5.js",
		"lib/store.js",
		"lib/loadscript.js",
		"mod.js"
	])
	.pipe(concat("mocket.min.js"))
	.pipe(wrapJs("(function(window, document, undefined) {%= body %})(window, document)"))
	.pipe(uglify({
		mangle: true,
		compress: {
			drop_console: true,
			unused: true
		}
	}))
	.pipe(gulp.dest("./"));
});