import { IContext } from "../common/types";
import { LoggerModel } from "../model/LoggerModel"

export function Logger() {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
    const old = descriptor.value;
    const controllerName = target.constructor.name;
    descriptor.value = async function log(ctx: IContext, ...args) {
      const content = JSON.stringify({
        session: ctx.cookies.get('session') || '',
        body: ctx.request.body || '{}',
        query: ctx.query,
        desc: 'before',
        referer: ctx.header.referer,
        ua: ctx.header["user-agent"],
        host: ctx.header.host,
        ip: ctx.ip,
        // cookies: ctx.cookies
      });

      await LoggerModel.record(controllerName, propertyKey, content);
      const result = await Reflect.apply(old, this, [ctx, ...args])
      // await LoggerModel.record(controllerName, propertyKey, content, result);

      return result;
    }

    return descriptor;
  }
}