const sidebar = require('./sidebar')
module.exports = {
  nav: [
    {
      text: 'Programming Language',
      items: [
        { text: 'Python', link: '/python/' },
        { text: 'C/C++', link: '/c/' }
      ]
    },
    {
      text: 'Deep learning',
      link: '/dl/'
    },
    {
      text: 'VQA',
      link: '/vqa/'
    },

  ],
  sidebar
}