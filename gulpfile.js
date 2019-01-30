var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    run = require('run-sequence');


gulp.task('sass', function () {
     gulp.src(['app/sass/main.scss'])
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer(['last 5 versions'], {cascade: true}))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('css-libs', function () {
   return gulp.src('app/sass/libs.scss')
        .pipe(sass())
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('build/css'));
});

gulp.task("build-css", function () {
    run('sass', 'css-libs')
});


gulp.task('scripts', function () {
    return gulp.src('app/js/mine.js')
        .pipe(uglify())
        .pipe(gulp.dest('build/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts-libs', function () {
    return gulp.src([
        'app/libs/jquery/dist/jquery.min.js',
        'app/libs/jquery.mmenu/dist/jquery.mmenu.js',
        'app/libs/jquery.mmenu/dist/addons/pagescroll/jquery.mmenu.pagescroll.js',
        'app/libs/OwlCarousel2-2.3.4/dist/owl.carousel.min.js',
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build/js'))
});


gulp.task('browser-sync', function () {
    browserSync.init({
        notify: false,
        proxy: 'http://testpsdhtml/',
        port: 3000
    });

});



gulp.task('img', function () {
    return gulp.src(['app/img/raster/**/*'], ['!app/img/svg'])
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('build/img/raster'));
});

gulp.task('fonts', function () {
    return gulp.src('app/fonts/**/*')
           .pipe(gulp.dest('build/fonts/'));
});


// creating svg spite
gulp.task('svgSprite', function () {
    return gulp.src('app/img/svg/**/*.svg')
    // minify svg
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        // remove all fill, style and stroke declarations in out shapes
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        // cheerio plugin create unnecessary string '&gt;', so replace it.
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../assets/img/svg/sprite.svg",
                    render: {
                        scss: {
                            dest: '../sass/_sprite.scss',
                            template: "app/sass/_sprite-template.scss"
                        }
                    }
                }

            }

        }))
        .pipe(gulp.dest('app/'));
});


gulp.task('clean', function () {
    return del.sync('build');
});

gulp.task('clear', function () {
    return cache.clearAll();
});
gulp.task('html', function () {
    return gulp.src('app/*.html').
    pipe(gulp.dest('build/'))
    .pipe(browserSync.reload({stream: true}));
});


gulp.task('watch', ['build', 'browser-sync'], function () {
    gulp.watch('app/sass/**/*.scss', ['sass']);
    gulp.watch('app/img/svg/**/*.svg', ['svgSprite']);//test
    gulp.watch('app/img/raster/**/*.*', ['img']);//test
    gulp.watch('app/**/*.php', browserSync.reload);
    gulp.watch('app/**/*.html', ['html']);
    gulp.watch('app/js/**/*.js', ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
});

gulp.task('build', ['clean', 'sass', 'css-libs', 'scripts', 'scripts-libs', 'img', 'svgSprite', 'fonts'], function () {
    var buildCss = gulp.src([
        'app/css/main.css',
        'app/css/libs.min.css',
    ])
        .pipe(gulp.dest('build/css'));

    var buildFonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('build/fonts'));

    var buildJs = gulp.src('app/js/**/*')
        .pipe(gulp.dest('build/js'));

    var buildHTML = gulp.src('app/*.html').pipe(gulp.dest('build/'));
});

