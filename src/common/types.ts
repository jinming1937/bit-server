import Koa from 'koa'

export type IContext = Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>