import { MethodType } from "./common";
import { ONE_HOUR_MILLISECOND } from "../libs/const";

const anonymous = async (ctx) => {
  ctx.body = {
    code: -1,
    data: null,
    msg: 'login status invalid.'
  }
}

export function authorize(type: MethodType = MethodType.Method) {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
    const fn = target[propertyKey]; // descriptor.value;
    const old = descriptor.value;
    const fnPropDescriptors = Object.getOwnPropertyDescriptors(fn);
    const fnPropSymbols = Object.getOwnPropertySymbols(fn);
    const symbolDescriptors = {};

    console.log('after get or post method and before class');

    fnPropSymbols.forEach((name) => {
      Object.assign(symbolDescriptors, {
        [name]: old || {}
      });
    })

    Object.defineProperties(anonymous, { ...fnPropDescriptors, ...symbolDescriptors });
    // 这里写法注意一个问题：不能直接一个箭头函数赋值给descriptor.value，箭头函数绑定this,会导致外部无法注入作用域
    descriptor.value = async function func(ctx, ...args) {
      const session = ctx.cookies.get('session');
      if (this.Session && session && (session === this.Session)) {
        // console.log(ctx.cookies.get('session'));
        if (ctx.method === 'POST') {
          ctx.cookies.set('session', session, {
            httpOnly: true,
            maxAge: ONE_HOUR_MILLISECOND,
            expires: new Date(),
            overwrite: true,
          })
        }
        return Reflect.apply(old, this, [ctx, ...args])
      } else {
        return Reflect.apply(anonymous, this, [ctx, ...args])
      }
    }
    Object.defineProperties(descriptor.value, { ...fnPropDescriptors });
    return descriptor;
  }
}
