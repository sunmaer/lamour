module.exports = {
  base: '/',
  title: '小江大海',
  description: '小江和小孙的博客站点',
  dest: 'dist',
  head: [
    ['link', {
      rel: 'icon',
      href: '//vfiles.gtimg.cn/vupload/202005/6486c41590311911051.ico'
    }]
  ],
  themeConfig: {
    nav: [{
      text: '关于我们',
      link: '/about/'
    }],
    sidebarDepth: 2,
    sidebar: [{
      title: '💻 前端知识',
      collapsable: false,
      children: [
        ['frontend/standardPackage.md', '封装一个标准的 NPM 包'],
        ['frontend/intersectionObserver.md', 'IntersectionObserverAPI 应用'],
      ]
    }, {
      title: '🚀 产品分享',
      collapsable: false,
      children: [
        ['produkt/demo.md', '产品评测'],
      ]
    }, {
      title: '📷 生活感悟',
      collapsable: false,
      children: [
        ['life/demo.md', '旅行'],
      ]
    }, {
      title: '💖 关于我们',
      path: '/about/',
      collapsable: false
    }],
    lastUpdated: '上次更新',
    repo: 'https://github.com/sunmaer/lamour',
    repoLabel: 'GitHub'
  },
  markdown: {
    extendMarkdown: md => {
      md.use(require('markdown-it-task-lists'))
    }
  }
}