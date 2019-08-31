const sidebar = require('./sidebar')
module.exports = {
  nav: [
    {
      text: '前端三剑客',
      items: [
        { text: 'JavaScript', link: '/js/' },
        { text: 'CSS', link: '/css/' }
      ]
    },
    {
      text: 'Vue',
      link: '/vue/'
    },
    // {
    //   text: 'React',
    //   link: '/react/'
    // },
    {
      text: 'Node',
      items: [
        {
          text: 'Node',
          link: '/node/'
        },
        {
          text: 'Egg',
          link: '/egg/'
        }
      ]
    },
    {
      text: 'Webpack',
      link: '/webpack/'
    },
    {
      text: '组件',
      link: '/components/'
    }
  ],
  sidebar
}