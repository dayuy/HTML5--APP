(function() {
    //封装的localstorage方法
    var Util = (function() {
        var prefix = 'html_reader_';
        var StorageGetter = function(key) {
            return localStorage.getItem(prefix + key);
        }
        var StorageSetter = function(key, pram) {
            return localStorage.setItem(prefix + key, pram);
        }
        var getBSONP = function(url,callback){
        	return $.jsonp({
        		url:url,
        		cache:true,
        		callback:'duokan_fiction_chapter',
        		success:function(result){
        			var data = $.base64.decode(result);
        			var json = decodeURIComponent(escape(data));
        			callback(data);
        		}
        	})
        }
        return {
        	getBSONP:getBSONP,
            StorageGetter: StorageGetter,
            StorageSetter: StorageSetter
        }
    })();

    var Dom = {
        top_nav: $('#fiction_chapter_title'),
        bottom_nav: $('#bottom_nav'),
        nav_pannel_box: $(".nav_pannel_box")
    }

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




    function main() {
        //整个项目的入口函数
        EventHandle();
        var readerModel = ReaderModel();
        var readerUI = ReaderBaseFrame(RootContainer);
        readerModel.init(function(data){
        	readerUI(data);
        });
    }

    function ReaderModel() {
        //2实现和阅读器相关的数据交互的方法
        var Chapter_id;
        var ChapterTotal;
        var init = function(UIcallback){
        	getFictionInfo(function(){
        		getCurChapterContent(Chapter_id,function(data){
        			//4数据
        			callback && callback(data)
        		});
        	})
        }
        var getFictionInfo = function(callback){
        	$.get('./data/chapter.json',function(data){
        		//do 获得章节后的回调函数
        		console.log(data)
        		Chapter_id = data.chapters[1].chapter_id;
        		ChapterTotal = data.chapters.length;
        		callback && callback();
        	},'json');
        }
        var getCurChapterContent = function(chapter_id,callback){
        	$.get('./data/data'+ chapter_id +'.json',function(data){
        		if(data.result == 0){
        			var url = data.jsonp;
        			//发起jsonp请求 ，解码，封装一个方法。
        			Util.getBSONP(url,function(data){
        				callback && callback(data)
        			});
        		}
        	},'json')
        }

        //上一章、下一章
        var prevChapter = function(UIcallback){
        	Chapter_id = parseInt(chapter_id,10);
        	if (Chapter_id == 0) {
        		return;
        	}
        	Chapter_id -= 1;
        	getCurChapterContent(Chapter_id,UIcallback);
        }
        var nextChapter = function(UIcallback){
        	Chapter_id = parseInt(chapter_id,10);
        	if (Chapter_id == ChapterTotal) {
        		return;
        	}
        	Chapter_id += 1;
        	getCurChapterContent(Chapter_id,UIcallback);
        }
        return {
        	init:init,
        	prevChapter:prevChapter,
        	nextChapter:nextChapter
        }
    }

    function ReaderBaseFrame(container) {
        //3渲染基本的UI结构
        function parseChapterData(jsonData){
        	var jsonObj = JSON.parse(jsonData);
        	var html = '<h4>' + jsonObj.t +'</h4>';
        	for(var i=0;i<jsonObj.p.length;i++){
        		html += '<p>' + jsonObj.p[i] + '</p>';
        	}
        	return html;
        }
        return function(data){
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
        })

    }

    main();

})();
