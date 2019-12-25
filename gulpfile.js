"use strict";

// global plugins
let gulp = require("gulp");
let plumber = require("gulp-plumber");
let server = require("browser-sync").create();
let sourcemap = require("gulp-sourcemaps");
let concat = require("gulp-concat");
// file managment plugins
let rename = require("gulp-rename");
let del = require("del");
// css plugins
let sass = require("gulp-sass");
let tildeImporter = require("node-sass-tilde-importer");
let postcss = require("gulp-postcss");
let autoprefixer = require("autoprefixer");
let csso = require("gulp-csso");
// html plugins
let posthtml = require("gulp-posthtml");
let include = require("posthtml-include");
let htmlmin = require("gulp-htmlmin");
// image and svg plugins
let svgstore = require("gulp-svgstore");
// js plugin
let babel = require("gulp-babel");
let uglify = require("gulp-uglify");

sass.compiler = require("node-sass");

gulp.task("css", function () {
	return gulp.src("src/scss/style.scss")
		.pipe(plumber())
		.pipe(sourcemap.init())
		.pipe(sass({
            importer: tildeImporter
        }).on("error", sass.logError))
		.pipe(postcss([
			autoprefixer()
		]))
		.pipe(csso())
		.pipe(rename("style.min.css"))
		.pipe(sourcemap.write("."))
		.pipe(gulp.dest("dist/css"))
});

gulp.task("minjs", function() {
  return gulp.src("src/js/*.js")
    .pipe(sourcemap.init())
    .pipe(babel())
    .pipe(concat("script.js"))
    .pipe(uglify())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("dist/js"))
});

gulp.task("sprite", function () {
	return gulp.src("src/img/icon-*.svg")
		.pipe(svgstore({
			inlineSvg: true
		}))
		.pipe(rename("sprite.svg"))
		.pipe(gulp.dest("dist/img"));
});

gulp.task("html", function () {
	return gulp.src("src/*.html")
		.pipe(posthtml([
			include()
		]))
		.pipe(gulp.dest("dist"));
});

gulp.task("minhtml", function() {
  return gulp.src("dist/*.html")
  .pipe(htmlmin({
    collapseWhitespace: true
  }))
  .pipe(gulp.dest("dist"));
});

gulp.task("server", function () {
	server.init({
		server: "dist/",
		notify: false,
		open: true,
		cors: true,
		ui: false
	});

	gulp.watch("src/scss/**/*.scss", gulp.series("css", "refresh"));
  gulp.watch("src/js/**/*.js", gulp.series("minjs", "refresh"));
	gulp.watch("src/img/icon-*.svg", gulp.series("sprite", "html", "refresh"));
	gulp.watch("src/*.html", gulp.series("html", "refresh"));
});

gulp.task("refresh", function(done) {
	server.reload();
	done();
});

gulp.task("copy", function () {
	return gulp.src([
		"src/fonts/**/*.{woff,woff2}",
		"src/img/**"
	], {
		base: "src"
	})
	.pipe(gulp.dest("dist"));
});

gulp.task("clean", function () {
	return del("dist");
});

gulp.task("build", gulp.series("clean", "copy", "css", "minjs", "sprite", "html", "minhtml"));
gulp.task("start", gulp.series("build", "server"));
