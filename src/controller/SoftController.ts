import path from 'path';
import fs from 'fs';
import BaseController from './BaseController'
import { IContext } from '../common/types'
import { controller, get, options } from '../middleware/decorator'

const optionsConfig = {
  allowOrigin: ['http://localhost:9999'],
  allowMethods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['X-Requested-With', 'Content-Type', 'Accept'],
  allowCredentials: 'true'
}

const MineType = {
  'png': 'image/png',
  'gif': 'image/gif',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'webp': 'image/png',
}

@controller('/api/soft/')
export default class SoftController extends BaseController {
  
  @options('get_poem')
  @get('get_poem')
  async getPoem(ctx: IContext) {
    ctx.set('Access-Control-Allow-Origin', optionsConfig.allowOrigin.join(','))
    ctx.set('Access-Control-Allow-Headers', optionsConfig.allowHeaders.join(','))
    ctx.set('Access-Control-Allow-Methods', optionsConfig.allowMethods.join(','))
    ctx.set('Access-Control-Allow-Credentials', 'true')

    console.log('get req')
    ctx.body = {
      from: 'dictionary',
      creator: 'jm',
      hitokoto: `you speak in your native language, and I'll translate`
    }
  }

  @get('static/:imgstr')
  async getStatic(ctx: IContext) {
    const matcher = ctx.path.match(/\w+\.(png|jpeg|jpg|webp)$/);
    if (matcher) {
      const fileName = matcher[0];
      const ext = matcher[1];
      let contentType = MineType[ext] || 'image/png';
      const pathUrl = path.join(__dirname, `../../static/${fileName}`);

      const ims = ctx.req.headers["if-modified-since"];
      // 读取文件信息
      const stats = await fs.statSync(pathUrl);
      // 判断 浏览器请求的文件路径 的change 时间 stats.ctime
      // 浏览器请求头if-modified-since ===文件上次的修改时间 ，命中协商缓存，则返回 304 浏览器缓存中请求资源
      if (ims === stats.mtime.toJSON()) {
        ctx.res.statusCode = 304; //去浏览器缓存中找
        ctx.res.end(); //
        return;
      } else {
        //  if-modified-since !==文件上次的修改时间,响应头Last-modified 设置 当前请求文件的修改时间
        // 做下次 浏览器请求的last-modify-since的对应值
        ctx.set("last-modified", stats.mtime.toJSON());
      }
      console.log('file name', fileName);
      ctx.set('Content-Type', `${contentType}; charset=utf-8`);
      ctx.set("Cache-Control", "max-age=" + (24 * 60 * 60)); // 秒为单位
      ctx.set("Expires", new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString());
      ctx.body = fs.createReadStream(pathUrl)
    } else {
      ctx.res.writeHead(404, {
        "Content-Type": "text/plain",
      });
      /* 应该输出错误页面 */
      ctx.res.write(
        "This resource was not found on this server."
      );
    }
  }
}
