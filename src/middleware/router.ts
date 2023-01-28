import Router from 'koa-router';
import { IContext } from '../common/types';
import { IRouter } from './common';
// 中间件：处理http 相关

export const routers: IRouter[] = [];

export function registerRouter<T, U>(router: Router<T, U>, controllers: any[]) {
  controllers.forEach(([news, controller]) => {
    // const descriptors = Object.getOwnPropertyNames(controller);
    const symbols = Object.getOwnPropertySymbols(controller);
    // const fnName = [...descriptors, ...symbols].filter((name: string ) => typeof controller[name] === 'function' && name !== 'constructor');
    symbols.forEach((name) => {
      const {path, method, propertyKey} = controller[name] || {};
      if (path && method && propertyKey) {
        console.log('exec router', method, path);
        router[method](path, async (ctx: IContext) => {
          return Reflect.apply(controller[propertyKey], news, [ctx])
          // return controller[propertyKey].call(news, ctx)
        });
      }
    });
  })
}
