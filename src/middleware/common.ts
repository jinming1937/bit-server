export enum HttpMethod {
  Get = 'get',
  Post = 'post',
  Delete = 'delete',
  Put = 'put',
  Options = 'options'
};

export interface IRouter {
  method: HttpMethod;
  path: string;
  propertyKey: string;
}

export enum MethodType {
  Controller = 'controller',
  Method = 'method'
}