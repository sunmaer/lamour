# IntersectionObserverAPI 应用

## 前言
> 为了提升页面性能，项目中经常需要等待一些元素进入可视区域后再执行一些相关操作，比如图片懒加载或者加载更多等场景。我们一般都是监听根元素的 `scroll` 事件，然后结合元素的位置信息来判断，这种方法计算量大，而且 `scroll` 事件触发频率高很可能造成性能问题，以及代码阅读性不高。 `IntersectionObserver` 接口提供了一种异步观察目标元素与其祖先元素或顶级文档视窗 (viewport) 交叉状态的方法，`IntersectionObserver` 是异步的，不随着目标元素的滚动同步触发，性能较好；简洁的 API 清晰易读，逼格也很高。  

今天主要给大家分享下本人在日常开发中关于 `IntersectionObserver` 的一些实际应用，关于 API 原理以及介绍大家可以阅读 [Intersection Observer API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API) 和 [IntersectionObserver API 使用教程](https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html)。  
- [查看示例](https://sunmaer.github.io/juejin/intersection-observer/dist/)
- [示例代码](https://github.com/sunmaer/juejin/tree/master/intersection-observer)

## 应用
### 图片懒加载
使用 `IntersectionObserver` 非常容易实现图片懒加载，首先需要观察懒加载元素，然后等元素进入可视区域后设置图片 `src`；同时，还可以结合 [IntersectionObserver.rootMargin](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver/rootMargin) 实现提前加载图片，一般可以设置为 1~2 倍浏览器窗口的视口高度，优化用户体验。
```js
/**
 * @method lazyLoad
 * @param {NodeList} $imgList      图片元素集合
 * @param {number}   preloadHeight 预加载高度
 */
export function lazyLoad($imgList, preloadHeight = 1000) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { // 目标元素出现在 root 可视区，返回 true
        const $target = entry.target
        const src = $target.getAttribute('lazyload')

        if (src) {
          $target.setAttribute('src', src) // 真正加载图片
        }
        observer.unobserve($target) // 解除观察
      }
    })
  }, {
    rootMargin: `0px 0px ${preloadHeight}px 0px`,
  })

  Array.prototype.forEach.call($imgList, ($item) => {
    if ($item.getAttribute('src')) return // 过滤已经加载过的图片
    observer.observe($item) // 开始观察
  })
}
```

使用方法：
- 图片元素设置 `lazyload` 属性
```html
<img lazyload="图片链接" alt="图片说明">
```
- 观察图片元素
```js
lazyLoad(document.querySelectorAll("[lazyload]"))
```

### 元素吸顶、吸底
在一些 APP 外的分享页中经常会看到头部或者底部会固定一个 banner 位，一开始 banner 可能处于正常位置，当即将离开可视区域的时候会固定在屏幕视口顶部或者底部，这种场景页非常适合用 `IntersectionObserver` 来处理。如果页面结构比较简单可以直接使用  [ css 粘性布局](https://www.zhangxinxu.com/wordpress/2018/12/css-position-sticky/)。  
`IntersectionObserver` 实现元素固定思路也很简单，首先需要给固定元素包一层父元素，父元素指定高度占位，防止固定元素吸附时页面抖动，然后观察父元素的可视状态变化，当父元素即将离开可视区域时改变固定元素的样式。

```js
/**
 * @method fixBanner
 * @param {HTMLElement} $observeEle 观察元素
 * @param {HTMLElement} $fixEle     固定定位元素
 */
export function fixBanner($observeEle, $fixEle) {
  const $ele = $fixEle
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $ele.style.cssText = ''
      } else {
        $ele.style.cssText = 'position: fixed; top: 0; left: 0'
      }
    })
  }, {
    threshold: 1, // threshold 设置为 1 表示目标元素完全可见时触发回调函数
  })

  observer.observe($observeEle) // 开始观察
}
```

使用方法：
- 元素结构
```html
<!-- 父元素用来占位和观察可视状态 -->
<div class="mod_banner">
  <div class="banner">吸顶元素</div>
</div>
```
- 观察元素
```js
fixBanner(
  document.querySelector('.mod_banner'),
  document.querySelector('.banner')
)
```

### 加载更多
`IntersectionObserver` 实现加载更多需要在列表后面增加一个尾部元素（比如加载更多动画），当尾部元素进入可视区域就加载更多数据，注意尾部元素一定要一直处于所有列表元素的后面。
```js
function loadMore() {
  const observer = new IntersectionObserver(
    (entries) => {
      const loadingEntry = entries[0]

      if (loadingEntry.isIntersecting) {
        // 请求数据并插入列表
      }
    },
    {
      rootMargin: '0px 0px 600px 0px', // 提前加载高度
    },
  )

  observer.observe(document.querySelector('.mod_loading')) // 观察尾部元素
}
```

```!
提前加载高度不能随意设置，如果设置太大会导致尾部元素一直处于可视状态。
```

[完整代码](https://github.com/sunmaer/juejin/blob/master/intersection-observer/src/components/list.vue#L45)

### 曝光上报
业务开发完成后，产品同学一般都需要我们去上报一些数据，项目上线后可以通过数据分析来进行产品迭代优化。基本上报事件会包括页面曝光、元素曝光和元素点击，页面曝光可以结合页面的生命周期上报，元素点击可以使用事件冒泡处理，而元素曝光检测非常麻烦。因为元素的层级关系复杂，影响元素显隐状态的样式属性也很多，导致我们往往会耗费很大的精力在元素的曝光计算上，而且还可能会对页面造成严重的性能问题。数据上报作为一个和页面展示无关的附加功能，不应该对页面的性能造成影响，所以这里非常适合用 `IntersectionObserver` 来完成。本人最近在参与一个数据上报项目，后面会单独写一篇关于上报的分享。

## 兼容性
这么好用的 API，我们当然要看下它的兼容性，不幸的是还有很多的浏览器不支持，不过官方提供了 [polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill)，这样我们就可以在项目中愉快地使用了。

- 安装 ployfill
```sh
npm install intersection-observer --save-dev
```

- 入口文件引入
```js
import 'intersection-observer'
```

## 总结

这篇文章主要给大家分享了 `IntersectionObserver API` 的一些应用，关于更多的使用场景等着我们去发掘。  
感谢您的阅读，文章中有什么不对的地方欢迎指出~

参考文章
- [Intersection Observer API - MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API)
- [IntersectionObserver API 使用教程 - 阮一峰](https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html)
- [杀了个回马枪，还是说说position:sticky吧 - 张鑫旭](https://www.zhangxinxu.com/wordpress/2018/12/css-position-sticky/)