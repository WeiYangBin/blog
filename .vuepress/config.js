const {
  themeConfig
} = require('./config/')

module.exports = {
  title: 'Yangbin Wei',
  description: 'About Me',
  dest: 'dist',
  themeConfig,
  plugins: [
    [
      'vuepress-plugin-mathjax',
      {
        target: 'svg',
        macros: {
          '*': '\\times',
        },
      },
    ],
  ],
  // plugins: [
  //   [
  //     'vuepress-plugin-comment',
  //     {
  //       choosen: 'gitalk',
  //       options: {
  //         clientID: 'b97cdb14a8b4c92ed33c',
  //         clientSecret: '8de8ec03e99dfae940ec6aa28dad88245a8c1eac',
  //         repo: 'blog',
  //         owner: 'YangBin Wei',
  //         admin: ['YangBin Wei'],
  //         id: '<%- frontmatter.commentid || frontmatter.title %>',
  //         distractionFreeMode: false,  // Facebook-like distraction free mode
  //         labels: ['Gitalk', 'Comment'],
  //         title: '「评论」<%- frontmatter.title %>',
  //         body: '<%- frontmatter.title %>：<%- window.location.origin %><%- frontmatter.to.path || window.location.pathname %>'
  //       }
  //     }
  //   ]
  // ]
}