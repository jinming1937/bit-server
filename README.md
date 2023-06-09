# analysis

- node >= 12.22.0 or 14.17.0 or 16.0.0
- node KOA 框架 搭建服务器

## 项目工程

init

```bash
yarn install
```

dev

```bash
yarn dev
```

lint

```bash
yarn lint
```

publish

```bash
yarn build
```

notebook的服务

### decorator

```ts
function dec(id){
    console.log('evaluated', id);
    return (target, property, descriptor) => {
      console.log('executed', id);
      const old = descriptor.value;
      descriptor.value = function(..args) {
        console.log('before');
        old.apply(this, ...args)
        console.log('before');
      }

      return descriptor;
    }
}

class Example {
    @dec(1)
    @dec(2)
    method(){
      console.log(4);
    }
}
// evaluated 1  // 方法执行，返回装饰器
// evaluated 2  // 方法执行，返回装饰器
// executed 2   // 装饰器执行，装饰方法
// executed 1   // 装饰器执行，装饰方法
```
