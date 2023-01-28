// import 'reflect-metadata';
import { HttpMethod } from './common';

/**
 * symbol 类型的属性路径：用于关联路由
 * @type Symbol
*/
export const SYMBOL_PATH = Symbol('PATH_SYMBOL_PROPERTY');

/**
 * symbol 类型的属性：路由
 * @type Symbol
*/
export const SYMBOL_ROUTER = Symbol('ROUTER_SYMBOL_PROPERTY');

/**
 * 
 * @param path 
 * @param method 
 * @returns 
 */
export function metadata(path: string, method: HttpMethod) {
  console.log('1. decorator method:', path);
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
    const descriptors = Object.getOwnPropertyDescriptors(target);
    const symbols = Object.getOwnPropertySymbols(target);
    const symbolDescriptors = {};

    symbols.forEach((name) => {
      Object.assign(symbolDescriptors, {
        name: target[name]
      })
    });

    Object.defineProperties(target, Object.assign({}, {
      ...descriptors,
      ...symbolDescriptors,
      [Symbol('ROUTER_SYMBOL_PROPERTY')]: { value: { path, method, propertyKey }},
    }));

    console.log('2. class method');

    // console.log('router target', target, Object.getOwnPropertySymbols(target))
    // console.log('router target', target);

    return descriptor
  }
}


/**
 * 想把 controller 和 get、post 等decorator联系起来：
 * 
 * 由于装饰器都是独立的function,唯一共通点是，都有target, 也就是类的prototype(原型),那么往其注入属性即可在各个function中读到
 * 
 * GL实现方式
 * 
 * 1. 在 get、post 等装饰器中，使用 reflect-metadata 的 defineMetadata 在 target 上定义的 Symbol 类型的 router metadata
 * 
 * （定义前，先获取，再合并，最后define）
 * 
 * 2. 再在 controller 装饰器中，使用 reflect-metadata，在 target （controller class） 上定义 Symbol 类型的 path metadata
 * 
 * 3. 通过遍历controller目录中的controller文件,获取控制器class,然后获取每个class上的 path metadata 和 router metadata，拼接Path，完成router 的注册
 * 
 * 注意：decorator 的执行顺序：先 执行方法的装饰器，后 执行类的装饰器 
 * 
 * 选择 Symbol 类型，而不是 字符串key (['xx'])，可以有效不与业务key冲突而覆盖！！！
 * 
 * 这里 我尝试这样实现：依然是Symbol属性，但是数据定义还是用Object.defineXxx等方法（ES6+使用Reflect，还要引入包：reflect-metadata）
 * 
 * 次奥，装饰方法拿到的target ( target 的 prototype 「 BaseController { constructor... 等一系列方法  } 」 ) 和装饰 class 拿到的target（构造函数 「[Function: NoteBookController]」 ） 不一样
 * 
 * 在 class 的装饰器上 往 target 的prototype 上注入就OK了
 * 
 */

export function controller(path: string) {
  console.log('3. decorator controller', path);
  return (target) => {
    const descriptors = Object.getOwnPropertyDescriptors(target.prototype);
    const symbols = Object.getOwnPropertySymbols(target.prototype);
    const symbolDescriptors = {};

    symbols.forEach((name) => {
      const meta = target.prototype[name] || {};
      meta.path = path + (meta.path || '');
      Object.assign(symbolDescriptors, {
        [name]: meta
      })
    });
    
    Object.defineProperties(target.prototype, Object.assign({}, {
      ...descriptors,
      ...symbolDescriptors,
      // [Symbol('PATH_SYMBOL_PROPERTY')]: { value: {path} },
    }));

    console.log('4. class controller');

    // console.log('path target', target, Object.getOwnPropertySymbols(target))

    return target;
  }
}

export function get(path: string) {
  return metadata(path, HttpMethod.Get);
}

export function post(path: string) {
  return metadata(path, HttpMethod.Post);
}

export function options(path: string) {
  return metadata(path, HttpMethod.Options)
}