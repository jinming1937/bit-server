export interface IResponseData {
  data: unknown
  status: number
  msg: string
}

export interface IBaseController {
  insert: (qr: string) => void
  select: (qr: string) => void
  commonResponse: IResponseData
}

export default class BaseController implements IBaseController {
  commonResponse: IResponseData
  constructor() {
    this.commonResponse = {
      data: null,
      status: 200,
      msg: '',
    }
  }

  insert(qr: string): void {
    console.log(qr)
  }

  select(qr: string): void {
    console.log(qr)
  }
}
