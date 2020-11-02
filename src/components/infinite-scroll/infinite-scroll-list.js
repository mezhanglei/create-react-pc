/**
 * @file LucasHC
 * @date 2017年3月12日20:49:17
 */

var ajax = require('common:widget/js/util/ajax/ajax.es').ajax;
var tp = require('common:widget/js/util/template/template.es');

(function() {
    // alert('ok')
    
    var fetching = false; 
    // 用于加载内容请求第几屏内容，初始为1，以后每请求一次，递增1
    var page = 1;
    // 这是一个以已经加载过的图片src为key值的map, 对应value为true
    // var loaded = {};
    // dom缓存，只缓存最新一次下拉数据生成的DOM节点
    var slideCache = [];
    // 用于已经生成的DOM节点储存，存有item的offsetTop，offsetHeight
    var slideMap = {};
    // pageYOffset设置或返回当前页面相对于窗口显示区左上角的Y位置。
    // 另外，pageYOffset 属性是scrollY属性的别名，window.pageYOffset == window.scrollY;总是返回 true
    var lastScrollY = window.pageYOffset;
    
    // window cache
    var scrollY = window.pageYOffset;
    // 浏览器窗口的视口（viewport）高度
    var innerHeight;

    var topViewPort;
    var bottomViewPort;
    
    function isVisible (id) {
        var offTop;
        var offsetHeight;
        var data;
        var node;

        // 判断此元素是否已经懒加载正确渲染，分为在屏幕之上（已经懒加载完毕）和屏幕外，已经添加到dom中，但是还未请求图片（懒加载之前）
        if (slideMap[id]) {
            // 直接获取offTop，offsetHeight值
            offTop = slideMap[id].offTop;
            offsetHeight = slideMap[id].offsetHeight;
        }
        else {
            // 设置该节点，并且设置节点属性：node，offTop，offsetHeight
            node = document.getElementById(id);
            // offsetHeight是自身元素的高度
            offsetHeight = parseInt(node.offsetHeight);
            // 元素的上外缘距离最近采用定位父元素内壁的距离
            offTop = parseInt(node.offsetTop);

            data = {
                node: node,
                offTop: offTop,
                offsetHeight: offsetHeight
            };
            
            slideMap[id] = data;
        }

        if (offTop + offsetHeight > topViewPort && offTop < bottomViewPort) {
            return true;
        }
        else {
            return false;
        }
    }
    
    function updateItemCache (node) {
        var list = node.querySelectorAll('.slide');
        var len = list.length;
        slideCache = [];
        var obj;

        for (var i=0; i < len; i++) {
            obj = {
                node: list[i],
                id: list[i].getAttribute('id'),
                img: list[i].querySelector('.img')
            }
            obj.src = obj.img.getAttribute('data-src');
            slideCache.push(obj);
        };
    }
    
    function fetchContent () {
        // 设置加载状态锁
        if (fetching) {
            return;
        }
        else {
            fetching = true;
        }
        page++;
        ajax({
            url: (!location.pathname.indexOf('/m/') ? '/m' : '')
                + '/list/asyn?page=' + page + (+new Date),
            timeout: 300000,
            dataType: 'json'
        }).then(function (data) {
            if (data.errno) {
                return;
            }
            console.time('render');

            var dataList = data.data.list;
            var len = dataList.length;
            var ulContainer = document.getElementById('expList');
            var str = '';
            var frag = document.createElement('div');

            var tpl = __inline('content.tmpl');
            for (var i = 0; i < len; i++) {
                str = tpl({
                        dataList: dataList
                        });
            }
            frag.innerHTML = str;
            ulContainer.appendChild(frag);
            // 更新缓存
            updateItemCache(frag);
            // 已经拉去完毕，设置标识为true
            fetching = false;
            // 强制触发
            handleScroll(null, true);

            console.timeEnd('render');

        }, function (xhr, type) {
            console.log('Refresh:Ajax Error!');
        });
    }
    

    function handleDefer () {
        console.time('defer');

        // 获取dom缓存
        var list = slideCache;
        // 对于遍历list里的每一项，都使用一个变量，而不是在循环内部声明。节省内存，把性能高效，做到极致。
        var thisImg;

        for (var i = 0, len = list.length; i < len; i++) {
            thisImg = list[i].img; // 这里我们都是从内存中读取，而不用读取DOM节点
            var deferSrc = list[i].src; // 这里我们都是从内存中读取，而不用读取DOM节点
            // 判断元素是否可见
            if (isVisible(list[i].id)) {
                // 这个函数是图片onload逻辑
                var handler = function () {
                    var node = thisImg;
                    var src = deferSrc;
                    // 创建一个闭包
                    return function () {
                        node.src = src;
                        node.style.opacity = 1;
                        // loaded[deferSrc] = true;
                    }
                }
                var img = new Image();
                img.onload = handler();
                img.src = list[i].src;
                // thisImg.src = deferSrc;
            }
        }
        console.timeEnd('defer')
    }

    function handleScroll (e, force) {
        // 如果时间间隔内，没有发生滚动，且并未强制触发加载，则do nothing，再次间隔100毫秒之后查询
        // window.scrollY返回文档在垂直方向已滚动的像素值
        if (!force && lastScrollY === window.scrollY) {
            window.setTimeout(handleScroll, 100);
            return;
        }
        else {
            // 更新文档滚动位置
            lastScrollY = window.scrollY;
        }

        scrollY = window.scrollY;
        // 浏览器窗口的视口（viewport）高度赋值
        innerHeight = window.innerHeight;
        topViewPort = scrollY - 1000;
        bottomViewPort = scrollY + innerHeight + 1000;

        // 判断是否需要加载
        // document.body.offsetHeight;返回当前网页高度 
        if (window.scrollY + innerHeight + 200 > document.body.offsetHeight) {
            fetchContent();
        }
        // 实现懒加载
        handleDefer();
        // console.log(loaded);
        console.log(slideCache);
        console.log(slideMap);
        window.setTimeout(handleScroll, 100);
    } 

    
    // window.setTimeout(handleScroll, 100);

    // 用于第一屏的加载和渲染
    fetchContent();
}());