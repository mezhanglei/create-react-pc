UX Planet论坛上有过这么一篇[热门文章: Infinite Scrolling Best Practices](https://uxplanet.org/infinite-scrolling-best-practices-c7f24c9af1d#.6vfij8d11)，它从UX角度分析了无限滚动加载的设计实践。

无限滚动加载在互联网上到处都有应用：
豆瓣首页是一个，Facebook的Timeline是一个，Tweeter的话题列表也是一个。当你向下滚动，新的内容就神奇的“无中生有”了。这是一个得到广泛赞扬的用户体验。

无限滚动加载背后的技术挑战其实比想象中要多不少。尤其是要考虑页面性能，需要做到极致。
本文通过代码实例，来实现一个无限滚动加载效果。更重要的是，在实现过程中，对于页面性能的分析和处理力图做到最大化，希望对读者有所启发，同时也欢迎与我讨论。

## 性能测量
在开启我们的代码之前，有必要先了解一下常用的性能测量手段：

1）使用window.performance 

HTML5带来的performance API功能强大。我们可以使用其performance.now()精确计算程序执行时间。performance.now()与Date.now()不同的是，返回了以微秒（百万分之一秒）为单位的时间，更加精准。并且与 Date.now() 会受系统程序执行阻塞的影响不同，performance.now() 的时间是以恒定速率递增的，不受系统时间的影响（系统时间可被人为或软件调整）。
同时，也可以使用performance.mark()标记各种时间戳（就像在地图上打点），保存为各种测量值（测量地图上的点之间的距离），便可以批量地分析这些数据了。

2）使用console.time方法与console.timeEnd方法

其中console.time方法用于标记开始时间，console.timeEnd方法用于标记结束时间，并且将结束时间与开始时间之间经过的毫秒数在控制台中输出。

3）使用专业的测量工具／平台：jsPerf

这次实现中，我们使用第二种方法，因为它已经完全可以满足我们的需求，且兼容性更加全面。

## 整体思路和方案设计
我们要实现的页面样例如图，


![ye mian](http://upload-images.jianshu.io/upload_images/4363003-171fabf0f9d064c5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


它能够做到无限下拉加载内容。我把红线标出的部分叫做一个block-item，后续也都用这种命名。

1）关于设计方案，肯定第一个最基本、最朴素的思想是下拉到底部之后发送ajax异步请求，成功之后的回调里进行页面拼接。

2）但是观察页面布局，很明显图片较多，每一个block-item区块都有一张配图。当加载后的内容插入到页面中时，浏览器就开始获取图片。这意味着所有的图像同时下载，浏览器中的下载通道将被占满。同时，由于内容优先于用户浏览而加载，所以可能被迫下载底部那些永远也不会被用户浏览到的图像。
所以，我们需要设计一个懒加载效果，使得页面速度更快，并且节省用户的流量费用和延长电池寿命。

3）上一条提到的懒加载实现上，为了避免到真正的页面底部时才进行加载和渲染，而造成用户较长时间等待。我们可以设置一个合理阈值，在用户滚动到页面底部之前，先进行提前加载。

4）另外，页面滚动的事件肯定是需要监听的。同时，页面滚动问题也比较棘手，后面将专为滚动进行分析。

5）DOM操作我们知道是及其缓慢而低效的，有兴趣的同学可以研究一下jsPerf上一些经典的benchmark，比如[这篇](http://jsperf.com/jquery-cache-vs-dom-querying)。关于造成这种缓慢的原因，社区上同样有很多文章有过分析，这里就不再深入。但我想总结并补充的是：DOM操作，光是为了找一个节点，就从本质上比简单的检索内存中的值要慢。一些DOM操作还需要重新计算样式来读取或检索一个值。更突出的问题在于：DOM操作是阻塞的，所以当有一个DOM操作在进行时，其他的什么都不能做，包括用户与页面的交互（除了滚动）。这是一个极度伤害用户体验的事实。

所以，在下面的效果实现中，我采用了大量“不可思议”的DOM缓存，甚至极端的缓存everything。当然，这样做的收益也在最后部分有所展现。

### 滚动问题
滚动问题不难想象在于高频率的触发滚动事件处理上。具我亲测，在极端case下，滚动及其卡顿。即使滚动不卡顿，你可以打开Chrome控制台发现，帧速率也非常慢。关于帧速率的问题，我们有著名的16.7毫秒理论。关于这个时间分析，社区上也有不少文章阐述，这里不再展开。

针对于此，有很多读者会立刻想到“截流和防抖动函数”（Throttle和Debounce）。
简单总结一下：

1）Throttle允许我们限制激活响应的数量。我们可以限制每秒回调的数量。反过来，也就是说在激活下一个回调之前要等待多少时间;

2）Debounce意味着当事件发生时，我们不会立即激活回调。相反，我们等待一定的时间并检查相同的事件是否再次触发。如果是，我们重置定时器，并再次等待。如果在等待期间没有发生相同的事件，我们就立即激活回调。

具体这里就不代码实现了。原理明白之后，应该不难写出。

但是我这里想从移动端主要浏览器处理滚动的方式入手，来思考这个问题：

1）在Android机器上，用户滚动屏幕时，滚动事件高频率发生——在Galaxy－SIII手机上，大约频率是一秒一百次。这意味着，滚动处理函数也被调用了数百次，而这些又都是成本较大的函数。

2）在Safari浏览器上，我们遇到的问题恰恰是相反的：用户每次滚动屏幕时，滚动事件只在滚动动画停止时才触发。当用户在iPhone上滚动屏幕时，不会运行更新界面的代码（滚动停止时才会运行一次）。

另外，我想也许会有读者想到rAf（requestAnimationFrame），但是据我观察，很多前端其实并不明白requestAnimationFrame技术的原理和解决的问题。只是机械地把动画性能、掉帧问题甩到这么一个名词上。在真实项目中，也没有亲自实现过，更不要说考虑requestAnimationFrame的兼容性情况了。这里场景我并不会使用rAf，因为。setTimeout的定时器值推荐最小使用16.7ms（原因请去社区上找答案，不再细讲），我们这里并不会超过这个限制，并且考虑兼容性。关于这项技术的使用，如果有问题，欢迎留言讨论。

基于以上，我的解决方案是既不同于Throttle，也不同于Debounce，但是和这两个思想，尤其是Throttle又比较类似：把滚动事件替换为一个带有计时器的滚动处理程序，每100毫秒进行简单检查，看这段时间内用户是否滚动过。如果没有，则什么都不做；如果有，就进行处理。

### 用户体验优化小窍门
在图像加载完成时，使用淡入（fade in）效果出现。这在实际情况上会稍微慢一下，应该慢一个过渡执行时间。但用户体验上感觉会更快。这是已经被证实且普遍应用的小“trick”。但是据我感觉，它确实有效。我们的代码实现也采用了这个小窍门。不过类似这种“社会心理学”范畴的东西，显然不是本文研究的重点。


### 总结一下
代码上将会采用：超前阈值的懒加载＋DOM Cache和图片Cache＋滚动throttle模拟＋CSS fadeIn动画。
具体功能封装上和一些实现层面的东西，请您继续阅读。

## 代码实现
### DOM结构
整体结构如下：

```html
    <div class="exp-list-box" id="expListBox">
        <ul class="exp-list" id="expList">
        </ul>
        <div class="ui-refresh-down"></div>
    </div>
```

主体内容放在id为“expListBox”的container里面，id为“expList”的ul是页面加载内容的容器。
因为每次加载并append进入HTML的内容相对较多。我使用了模版来取代传统的字符串拼接。前端模版这次选用了我的同事[颜海镜大神的开源作品](https://github.com/yanhaijing/template.js)，模版结构为：

```html
     <#dataList.forEach(function (v) {#>
        <div id="s-<#=v.eid#>" class="slide">
            <li>
                <a href="<#=v.href#>">
                    <img class="img" src="data:image/gif;base64,R0lGODdhAQABAPAAAP%2F%2F%2FwAAACwAAAAAAQABAEACAkQBADs%3D" 
                    data-src="<#=v.src#>">
                    </img>
                    <strong><#=v.title#></strong>
                    <span class="writer"><#=v.writer#></span>
                    <span class="good-num"><#=v.succNum#></span>
                </a>
            </li>
        </div>
    <#})#>
```

以上模版内容由每次ajax请求到的数据填充，并添加进入页面，构成每个block-item。
这里需要注意观察，有助于对后面逻辑的理解。页面中一个block-item下div属性存有该block-item的eid值，对应class叫做"slide"，子孙节点包含有一个image标签，src初始赋值为1px的空白图进行占位。真实图片资源位置存储在"data-src"中。
另外，请求返回的数据dataList可以理解为由9个对象构成的数组，也就是说，每次请求加载9个block-item。

### 样式亮点
样式方面不是这篇文章的重点，挑选最核心的一行来说明一下：

```css
    .slide .img{
        display: inline-block;
        width: 90px;
        height: 90px;
        margin: 0 auto;
        opacity: 0;
        -webkit-transition: opacity 0.25s ease-in-out;
        -moz-transition: opacity 0.25s ease-in-out;
        -o-transition: opacity 0.25s ease-in-out;
        transition: opacity 0.25s ease-in-out;
    }
```

唯一需要注意的是image的opacity设置为0，图片将会在成功请求并渲染后调整为1，辅助transition属性实现一个fade in效果。
对应我们上面所提到的那个“trick”

### 逻辑部分
我是完全按照业务需求来设计，并没有做抽象。其实这样的一个下拉加载功能完全可以抽象出来。有兴趣的读者可以下去自己进行封装和抽象。
我们先把精力集中在逻辑处理上。
下面进入我们最核心的逻辑部分，为了防止全局污染，我把它放入了一个立即执行函数中：

```javascript
    (function() {
        var fetching = false; 
        var page = 1;
        var slideCache = [];
        var itemMap = {};
        var lastScrollY = window.pageYOffset;
        var scrollY = window.pageYOffset;
        var innerHeight;
        var topViewPort;
        var bottomViewPort;
        
        function isVisible (id) {
            // ...判断元素是否在可见区域
        }
        
        function updateItemCache (node) {
            // ....更新DOM缓存
        }
        
        function fetchContent () {
            // ...ajax请求数据
        }
        

        function handleDefer () {
            // ...懒加载实现
        }

        function handleScroll (e, force) {
            // ...滚动处理程序
        } 
        
        window.setTimeout(handleScroll, 100);
        fetchContent();
    }());
```

我认为好的编程习惯是在程序开头部分便声明所有的变量，防止“变量提升”带来的潜在困扰，并且也有利于程序的整体把控。
我们来看一下变量设置：

```javascript
    // 加载中状态锁
    1）var fetching = false;
    // 用于加载时发送请求参数，表示第几屏内容，初始为1，以后每请求一次，递增1
    2）var page = 1; 
    // 只缓存最新一次下拉数据生成的DOM节点，即需要插入的dom缓存数组
    3）var slideCache = []; 
    // 用于已经生成的DOM节点储存，存有item的offsetTop，offsetHeight
    4) var slideMap = {}; 
    // pageYOffset设置或返回当前页面相对于窗口显示区左上角的Y位置。
    5）var lastScrollY = window.pageYOffset; var scrollY = window.pageYOffset;
    // 浏览器窗口的视口（viewport）高度
    6）var innerHeight;
    // isVisible的上下阈值边界
    7) var topViewPort; 
    8) var bottomViewPort; 
```

关于DOM cache的变量详细说明，在后文有提供。

同样，我们有5个函数。在上面的代码中，注释已经写明白了每个方法的具体作用。接下来，我们逐个分析。

#### 滚动处理程序handleScroll
它接受两个变量，第二个是一个布尔值force，表示是否强制触发滚动程序执行。

核心思路是：如果时间间隔100毫秒内，没有发生滚动，且并未强制触发，则do nothing，间隔100毫秒之后再次查询，然后直接return。
其中，是否发生滚动由lastScrollY === window.scrollY来判断。
在100毫秒之内发生滚动或者强制触发时，需要判断是否滚动已接近页面底部。如果是，则拉取数据，调用fetchContent方法，并调用懒加载方法handleDefer。
并且在这个处理程序中，我们计算出来了isVisible区域的上下阈值。我们使用600作为浮动区间，这么做的目的是在一定范围内提前加载图片，节省用户等待时间。当然，如果我们进行抽象时，可以把这个值进行参数化。

```javascript
    function handleScroll (e, force) {
        // 如果时间间隔内，没有发生滚动，且并未强制触发加载，则do nothing，再次间隔100毫秒之后查询
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
        // 计算isVisible上下阈值
        topViewPort = scrollY - 1000;
        bottomViewPort = scrollY + innerHeight + 600;

        // 判断是否需要加载
        // document.body.offsetHeight;返回当前网页高度 
        if (window.scrollY + innerHeight + 200 > document.body.offsetHeight) {
            fetchContent();
        }
        // 实现懒加载
        handleDefer();
        window.setTimeout(handleScroll, 100);
    } 
```
 

#### 拉取数据
这里我用到了自己封装的ajax接口方法，它基于zepto的ajax方法，只不过又手动采用了promise包装一层。实现比较简单，当然有兴趣可以找我要一下代码，这里不再详细说了。
我们使用前端模版进行HTML渲染，同时调用updateItemCache，将此次数据拉取生成的DOM节点缓存。之后手动触发handleScroll，更新文档滚动位置和懒加载处理。

```javascript
    function fetchContent () {
        // 设置加载状态锁
        if (fetching) {
            return;
        }
        else {
            fetching = true;
        }
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
                str = tpl({dataList: dataList});
            }
            frag.innerHTML = str;
            ulContainer.appendChild(frag);
            // 更新缓存
            updateItemCache(frag);
            // 已经拉去完毕，设置标识为true
            fetching = false;
            // 强制触发
            handleScroll(null, true);
            page++;
            console.timeEnd('render');
        }, function (xhr, type) {
            console.log('Refresh:Ajax Error!');
        });
    }
```


#### 缓存对象
之前参数里提到过，一共有两个用于缓存的对象／数组：

1）slideCache：缓存最近一次加载过的数据生成的DOM内容，缓存方式为数组储存：

```javascript
    slideCache = [
        {
            id: "s-97r45",
            img: img DOM节点,
            node: 父容器DOM node,类似<div id="s-<#=v.eid#>" class="slide"></div>,
            src: 图片资源地址
        },
        ...
    ]
```

slideCache由updateItemCache函数更新，主要用于懒加载时的赋值src。这样我们做到“只写入DOM”原则，不需要再从DOM读取。

2）slideMap：缓存DOM节点的高度和offsetTop，以DOM节点的id为索引。存储方式：

```javascript
    slideMap = {
        s-97r45: {
            node: DOM node,类似<div id="s-<#=v.eid#>" class="slide"></div>,
            offTop: 300,
            offsetHeight: 90
        }
    }
```

slideMap根据isVisible方法的参数进行更新和读取。使得我们在判断是否isVisible时，大量减少读取DOM的操作。   


#### 懒加载程序
在上面的滚动处理程序中，我们调用了handleDefer函数。我们看一下这个函数的实现：

```javascript
    function handleDefer () {
        // 时间记录
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
                    }
                }
                var img = new Image();
                img.onload = handler();
                img.src = list[i].src;
            }
        }
        console.timeEnd('defer');
    }
```

主要思路就是对DOM缓存中的每一项进行循环遍历。在循环中，判断每一项是否已经进入isVisible区域。如果进入isVisible区域，则对当前项进行真实src赋值，并设置opacity为1。


#### 更新拉取数据生成的DOM缓存
针对每一个slide类，我们缓存对应DOM节、id、子元素img DOM节点：

```javascript
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
```


#### 是否在isVisible区域判断
该函数接受相应DOM id，并进行判断。
如果判断条件晦涩难懂的话，你一定要手动画画图理解一下。如果你就是懒得画图，那么也没关系，我帮你画好了，只是丑一些。。。

```javascript
    function isVisible (id) {
        var offTop;
        var offsetHeight;
        var data;
        var node;

        // 判断此元素是否已经懒加载正确渲染，分为在屏幕之上（已经懒加载完毕）和屏幕外，已经添加到dom中，但是还未请求图片（懒加载之前）
        if (itemMap[id]) {
            // 直接获取offTop，offsetHeight值
            offTop = itemMap[id].offTop;
            offsetHeight = itemMap[id].offsetHeight;
        }
        else {
            // 设置该节点，并且设置节点属性：node，offTop，offsetHeight
            node = document.getElementById(id);
            // offsetHeight是自身元素的高度
            offsetHeight = parseInt(node.offsetHeight);
            // 元素的上外缘距离最近采用定位父元素内壁的距离
            offTop = parseInt(node.offsetTop);
        }

        if (offTop + offsetHeight > topViewPort && offTop < bottomViewPort) {
            return true;
        }
        else {
            return false;
        }
    }
```


![手绘图示](http://upload-images.jianshu.io/upload_images/4363003-090711cd8ac05439.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



### 性能收益
如上代码，我们主要进行了两方面的性能考量：

1）延迟加载时间

2）渲染DOM时间

整体收益如下：

优化前延迟平均值：49.2ms     中间值：43ms；

优化后延迟平均值：17.1ms     中间值：11ms；


优化前渲染平均值：2129.6ms   中间值：2153.5ms；

优化后渲染平均值：120.5ms    中间值：86ms；


## 继续思考
做完这些，其实也远远没有达到所谓的“极致化”性能体验。我们无非就做了各种DOM缓存、映射、懒加载。如果继续分析edge case，我们还能做的更多，比如：DOM回收、墓碑和滚动锚定。这些其实很多都是借鉴客户端开发理念，但是超前的谷歌开发者团队也都有了自己的实现。比如在去年7月份的
[一篇文章：Complexities of an Infinite Scroller](https://developers.google.com/web/updates/2016/07/infinite-scroller)就都有所提及。这里从原理（非代码）层面，也给大家做个介绍。

### DOM回收
它的原理是，对于需要产生的大量DOM节点（比如我们下拉加载的信息内容）不是主动用createElement的方式创建，而是回收利用那些已经移出视窗，暂时不会被需要的DOM节点。如图：


![动图（盗图）](http://upload-images.jianshu.io/upload_images/4363003-2f8dbaf7e5835ae7.gif?imageMogr2/auto-orient/strip)


虽然DOM节点本身并非耗能大户，但是也不是一点都不消耗性能，每一个节点都会增加一些额外的内存、布局、样式和绘制。同样需要注意的一点是，在一个较大的DOM中每一次重新布局或重新应用样式（在节点上增加或删除样式所触发的过程）的系统开销都会比较昂贵。所以进行DOM回收意味着我们会保持DOM节点在一个比较低的数量上，进而加快上面提到的这些处理过程。

据我观察，在真正产品线上使用这项技术的还比较少。可能是因为实现复杂度和收益比并不很高。但是，淘宝移动端检索页面实现了类似的思想。如下图，


![淘宝做法](http://upload-images.jianshu.io/upload_images/4363003-0061161e556d5eb7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


每加载一次数据，就生成“.page-container  .J-PageContainer_页数”的div，在滚动多屏之后，早已移除视窗的div的子节点进行了remove()，并且为了保证滚动条的正确比例和防止高度塌陷，显示声明了2956px的高度。


### 墓碑（Tombstones）
如之前所说，如果网络延迟较大，用户又飞快地滚动，很容易就把我们渲染的DOM节点都甩在千里之外。这样就会出现极差的用户体验。针对这种情况，我们就需要一个墓碑条目占位在对应位置。等到数据取到之后，再代替墓碑。墓碑也可以有一个独立的DOM元素池。并且也可以设计出一些漂亮的过渡。这种技术在国外的一些“引领技术潮流”的网站上，早已经有了应有。比如下图取自Facebook：


![Facebook墓碑](http://upload-images.jianshu.io/upload_images/4363003-08538a8b13850dc0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


我在“简书”APP客户端上，也见过类似的方案。当然，人家是native...


![简书客户端](http://upload-images.jianshu.io/upload_images/4363003-9ff0c18089a1ddc2.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 滚动锚定
滚动锚定的触发时机有两个：一个是墓碑被替换时，另一个是窗口大小发生改变时（在设备发生翻转时也会发生）。这两种情况，都需要调整对应的滚动位置。


## 总结
当你想提供一个高性能的有良好用户体验的功能时，可能技术上一个简单的问题，就会演变成复杂问题的。这篇文章便是一个例证。
随着 “Progressive Web Apps” 逐渐成为移动设备的一等公民（会吗？），高性能的良好体验会变得越来越重要。
开发者也必须持续的研究使用一些模式来应对性能约束。这些设计的基础当然都是成熟的技术为根本。

这篇文章参考了Flicker工程师，前YAHOO工程师Stephen Woods的《Building Touch Interfaces with HTML5》一书。以及王芃前辈对于《Complexities of an Infinite Scroller》一文的部分翻译。