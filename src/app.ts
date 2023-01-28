import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'

import HomeController from './controller/HomeController'
import NotebookController from './controller/NotebookController'
import SoftController from './controller/SoftController';
import UploadController from './controller/UploadController'
import { registerRouter } from './middleware/router'

const app = new Koa()
const router = new Router()
const home = new HomeController()
const notebook = new NotebookController();
const soft = new SoftController();
const upload = new UploadController();

app.on('error', e => {
  console.log(`[${new Date().toLocaleString()}]:出错了！！`)
})

// logger
app.use(async (ctx, next) => {
  await next()
  const rt = ctx.response.get('X-Response-Time')
  console.log(`[${new Date().toLocaleString()}]:${ctx.method} ${ctx.url} - ${rt}`)
})

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms === 0 ? '<0.5' : ms}ms`)
})

// console.log(notebook, NotebookController.prototype);
registerRouter<any, {}>(router, [
  [home, HomeController.prototype],
  [notebook, NotebookController.prototype],
  [soft, SoftController.prototype],
  [upload, UploadController.prototype]
]);

app.use(bodyParser())
app.use(router.routes())
app.listen(9960)

console.log('your application has run at port 9960')
