(function() {
    'use strict';
    //封装的localstorage方法
    var Util = (function() {
        var prefix = 'html_reader_';
        var StorageGetter = function(key) {
            return localStorage.getItem(prefix + key);
        }
        var StorageSetter = function(key, pram) {
            return localStorage.setItem(prefix + key, pram);
        }
        var getBSONP = function(url, callback) {
            return $.jsonp({
                url: url,
                cache: true,
                callback: 'duokan_fiction_chapter',
                success: function(result) {
                    // 用base64解码
                    var data = $.base64.decode(result);
                    var json = decodeURIComponent(escape(data));
                    callback(json);
                }
            })
        }
        return {
            getBSONP: getBSONP,
            StorageGetter: StorageGetter,
            StorageSetter: StorageSetter
        }
    })();

    var Dom = {
        top_nav: $('#fiction_chapter_title'),
        bottom_nav: $('#bottom_nav'),
        nav_pannel_box: $(".nav_pannel_box")
    }
    var readerModel;
    var readerUI;

    //读取存储中的字体大小
    var RootContainer = $('#fiction_container');
    var initFontSize = Util.StorageGetter('font-size');
    initFontSize = parseInt(initFontSize);
    if (!initFontSize) {
        initFontSize = 14;
    }
    RootContainer.css('font-size', initFontSize);

    //读取存储中的背景颜色
    var initBackground = Util.StorageGetter('background-color');
    $("#root").css('background-color', initBackground);
    if (initBackground == 'rgb(16, 16, 13)') {
        RootContainer.css('color', '#555');
    } else {
        RootContainer.css('color', '#000');
    }

    //读取当前章节
    //Chapter_id = Util.StorageGetter('ChapterId');






    function main() {
        //整个项目的入口函数
        readerModel = ReaderModel();
        readerUI = ReaderBaseFrame(RootContainer);

        readerModel.init(function(data) {
            readerUI(data);
        });

        EventHandle();
    }

    function ReaderModel() {
        //2实现和阅读器相关的数据交互的方法
        var Chapter_id;
        var ChapterTotal;
        var init = function(UIcallback) {
                getFictionInfoPromise().then(function(d) {
                    return getCurChapterContentPromise();
                }).then(function(data) {
                    UIcallback && UIcallback(data);
                })
        }
        var getFictionInfoPromise = function() {
                return new Promise(function(resolve, reject) {
                    $.get('data/chapter.json', function(data) {
                        //do 获得章节后的回调函数
                        if (data.result == 0) {
                            Chapter_id = Util.StorageGetter('ChapterId') //使用记录缓存中的章节
                            if (Chapter_id == null) {
                                Chapter_id = data.chapters[1].chapter_id; //默认章节
                            }
                            ChapterTotal = data.chapters.length;
                            resolve(data);
                        } else {
                            reject({msg:'fail'});
                        }
                    }, 'json');
                })
        }
        var getCurChapterContentPromise = function() {
                return new Promise(function(resolve, reject) {
                    $.get('data/data' + chapter_id + '.json', function(data) {
                        if (data.result == 0) {
                            var url = data.jsonp;
                            //发起jsonp请求 ，解码，封装一个方法。
                            Util.getBSONP(url, function(data) {
                                resolve(data);
                            });
                        } else {
                            reject({ msg: 'fail' });
                        }
                    }, 'json')

                })
        }
            //5上一章、下一章
        var prevChapter = function(UIcallback) {
            Chapter_id = parseInt(Chapter_id, 10);
            if (Chapter_id == 1) {
                return;
            }
            Chapter_id -= 1;
            getCurChapterContent(Chapter_id, UIcallback);
            Util.StorageSetter('ChapterId', Chapter_id);
        }
        var nextChapter = function(UIcallback) {
            Chapter_id = parseInt(Chapter_id, 10);
            console.log(ChapterTotal)
            if (Chapter_id == ChapterTotal) {
                return;
            }
            Chapter_id += 1;
            getCurChapterContent(Chapter_id, UIcallback);
            Util.StorageSetter('ChapterId', Chapter_id);
        }
        return {
            init: init,
            prevChapter: prevChapter,
            nextChapter: nextChapter,
            getCurChapterContent: getCurChapterContent
        }
    }

    function ReaderBaseFrame(container) {
        //3渲染基本的UI结构
        function parseChapterData(jsonData) {
            var jsonObj = JSON.parse(jsonData);
            var html = '<h4>' + jsonObj.t + '</h4>';
            for (var i = 0; i < jsonObj.p.length; i++) {
                html += '<p>' + jsonObj.p[i] + '</p>';
            }
            return html;
        }
        return function(data) {
            container.html(parseChapterData(data));
        }
    }

    function EventHandle() {
        //1.交互的事件绑定
        $('#action-mid').click(function() {
            if (Dom.top_nav.css('display') == 'none') {
                Dom.bottom_nav.show();
                Dom.top_nav.show();
            } else {
                Dom.bottom_nav.hide();
                Dom.top_nav.hide();
                Dom.nav_pannel_box.hide();
                $('.footer-icon2').removeClass('current');
            }
        });
        $(window).scroll(function() {
            Dom.bottom_nav.hide();
            Dom.top_nav.hide();
            Dom.nav_pannel_box.hide();
            $('.footer-icon2').removeClass('current');
        });

        $("#night_btn").click(function() {
            $('.bk-container')[3].click();
        });

        $("#large-font").click(function() {
            if (initFontSize > 20) {
                return;
            }
            initFontSize += 1;
            RootContainer.css('font-size', initFontSize);
            Util.StorageSetter('font-size', initFontSize);
        });

        $("#small-font").click(function() {
            if (initFontSize < 12) {
                return;
            }
            initFontSize -= 1;
            RootContainer.css('font-size', initFontSize);
            Util.StorageSetter('font-size', initFontSize); //存储字体
        });

        $("#font_btn").click(function() {
            if (Dom.nav_pannel_box.css('display') == 'none') {
                Dom.nav_pannel_box.show();
                $('.footer-icon2').addClass('current');
            } else {
                Dom.nav_pannel_box.hide();
                $('.footer-icon2').removeClass('current');
            }
        });

        //背景改变
        $('.bk-container').click(function() {
            var background = $(this).css('background-color');
            $("#root").css('background-color', background);
            Util.StorageSetter('background-color', background);
            if (background == 'rgb(16, 16, 13)') {
                RootContainer.css('color', '#555');
            } else {
                RootContainer.css('color', '#000');
            }
        });

        //翻章
        $('#pre_button').click(function() {
            //获得章节信息并渲染
            readerModel.prevChapter(function(data) {
                readerUI(data);
            });
        });

        $('#next_button').click(function() {
            readerModel.nextChapter(function(data) {
                readerUI(data);
            });

        });

    }

    main();
})();
