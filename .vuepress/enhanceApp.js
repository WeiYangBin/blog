import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import vElementTableHeader from 'v-element-table-header'
import 'v-element-table-header/lib/main.css'

export default ({
                  Vue, // 当前 VuePress 应用所使用的 Vue 版本
                  options, // 根 Vue 实例的选项
                  router, // 应用程序的路由实例
                  siteData // 网站元数据
                }) => {
  Vue.use(ElementUI)
  Vue.use(vElementTableHeader)
}