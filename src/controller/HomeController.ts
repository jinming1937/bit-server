import BaseController from './BaseController'
import { controller, get } from '../middleware/decorator'

@controller('/api/home/')
export default class HomeController extends BaseController {
  @get('test')
  async test(ctx) {
    ctx.accepts('application/json')
    ctx.body = {a: 1}
  }
}
