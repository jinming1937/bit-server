import BaseController from './BaseController'
import md5 from 'blueimp-md5'
import { NotebookModel } from '../model/NotebookModel'
import { controller, get, post } from '../middleware/decorator';
import { authorize } from '../middleware/authorization';
import { ONE_HOUR_MILLISECOND } from "../libs/const";
import { IContext } from '../common/types';

enum fileType {
  content = 'content',
  file = 'file'
}

interface IInsertRes {
  affectedRows: number;
  changedRows: number;
  fieldCount: number;
  insertId: number;
  message: string
  protocol41: boolean;
  serverStatus: number;
  warningCount: number;
}

interface IUpdateRes {
  affectedRows: number;
  changedRows: number;
  fieldCount: number;
  insertId: number;
  message: string;
  protocol41: boolean;
  serverStatus: number;
  warningCount: number;
}

interface IContent {
  name: string;
  id: number;
  parent: number;
  type: 'content' | 'file';
  serial: number;
  create_time: string;
  children?: IContent[];
}

interface IArticle {
  content_id: number;
  article_id: number;
  content: string;
  create_time: string;
  update_time: string;
}

@controller('/api/nb/')
export default class NoteBookController extends BaseController {
  session: string;

  get Session() {
    return this.session;
  }

  set Session(val: string) {
    this.session = val;
  }

  generatorTree(list: IContent[]) {
    let rootIndex = list.findIndex((item) => item.parent === -1);
    const baseRoot = list.splice(rootIndex, 1)[0];
    if (!baseRoot.children) {
      baseRoot.children = [];
    }
    const find = (list: IContent[], root: IContent) => {
      const children: IContent[] = [];
      if (list.length >= 1) {
        for(let i = list.length - 1; i >= 0; i--) {
          if (list[i].parent === root.id) {
            children.push(list[i]);
            list.splice(i, 1);
          }
        }
      }
      // 这里逆序一下：因为list是倒序push的，有助于提高性能
      children.reverse().forEach((item) => {
        if (!item.children) {
          item.children = [];
        }
        item.children.push(...find(list, item));
      });
      return children;
    }
    baseRoot.children.push(...find(list, baseRoot));
    return baseRoot;
  }

  @authorize()
  @get('get_content_tree')
  async getContentTree(ctx) {
    ctx.accepts('application/json')
    const req = await this.getContentTreeData();
    const data = this.generatorTree(req.data);
    ctx.body = {...req, data};
  }

  @authorize()
  @get('get_content_list')
  async getContentList(ctx) {
    ctx.accepts('application/json')
    const req = await this.getContentTreeData();
    const data = req.data;
    ctx.body = {...req, data};
  }

  @authorize()
  @post('add_content')
  async addContent(ctx) {
    const res = Object.assign({}, this.commonResponse)
    const data = ctx.request.body
    if (data && data.name && data.type && data.parent_id) {
      const resp = await this.insertContent(data.name, data.type, data.parent_id)
      if (resp.data) {
        res.data = resp.data;
        res.msg = 'success'
      } else {
        res.data = null
        res.msg = 'error'
      }
    } else {
      res.data = null
      res.msg = 'params error'
      res.status = 500
    }
    ctx.body = res
  }

  @authorize()
  @post('remove_content')
  async removeContent(ctx) {
    const res = Object.assign({}, this.commonResponse)
    const data = ctx.request.body
    if (data && data.id) {
      const resp = await this.deleteContent(data.id)
      if (resp.data) {
        res.data = resp.data;
        res.msg = 'success'
      } else {
        res.data = null
        res.msg = 'error'
      }
    } else {
      res.data = null
      res.msg = 'params error'
      res.status = 500
    }
    ctx.body = res
  }

  @authorize()
  @post('change_content')
  async changeContent(ctx) {
    const res = Object.assign({}, this.commonResponse)
    const data = ctx.request.body
    if (data && data.id && data.name) {
      const resp = await this.updateContentTitle(data.name, data.id)
      if (resp.data) {
        res.data = resp.data;
        res.msg = 'success'
      } else {
        res.data = null
        res.msg = 'error'
        res.status = 500
      }
    } else {
      res.data = null
      res.msg = 'params error'
      res.status = 500
    }
    ctx.body = res
  }

  @authorize()
  @get('get_file')
  async getFile(ctx) {
    const res = Object.assign({}, this.commonResponse)
    ctx.accepts('application/json')
    if (ctx.query.id) {
      const req = await this.getArticle(ctx.query.id as string);
      res.data = req;
    }
    ctx.body = res;
  }

  @authorize()
  @post('save_file')
  async saveFile(ctx) {
    const res = Object.assign({}, this.commonResponse)
    const data = ctx.request.body
    if (data && data.id) {
      const article = await this.getArticle<IArticle>(data.id) // 从 目录-文章表中找到关联，没有则创建关联，创建文章
      // console.log('get', article);
      if (article && article.article_id) {
        const saveResp = await this.saveArticle<unknown>(article.article_id, data.value)
        if (saveResp) {
          res.data = saveResp;
        }
      } else {
        const addResp = await this.createArticle(data.id, data.value)
        if (addResp) {
          res.data = addResp
        }
      }
    } else {
      res.data = null
      res.msg = 'params error'
      res.status = 500
    }
    ctx.body = res
  }

  @authorize()
  @get('heat_bit')
  async heatBit(ctx) {
    const session = ctx.cookies.get('session');
    let flag = 1; // 登录态过期
    // console.log(this.Session, this.session, this);
    if (session === this.Session) {
      flag = 0; // 登录态有效
    }
    ctx.body = { data: flag };
  }

  @post('login')
  async login(ctx) {
    const res = Object.assign({}, this.commonResponse)
    const data = ctx.request.body
    if (data.pwd && data.user) {
      const result = await this.loginAccount(data.user.trim(), md5(data.pwd.trim()));
      // console.log(result);
      if (result && result.code === 0) {
        res.data = true;
        res.msg = 'login success!!';
        this.Session = md5(`${Math.random().toFixed(4)} + ${Date.now()}`);
        ctx.cookies.set('session', this.Session, {
          httpOnly: true,
          maxAge: ONE_HOUR_MILLISECOND,
          expires: new Date(),
          overwrite: true,
        })
      } else {
        res.msg = `password doesn't match account!!!`;
      }
    } else {
      res.msg = 'please input account and password!!!';
    }
    ctx.body = res
  }

  @authorize()
  @post('logout')
  async logout(ctx) {
    const res = Object.assign({}, this.commonResponse)
    const validCookie = ctx.cookies.get('session');
    if (validCookie) {
      ctx.cookies.set('session', null);
      res.data = true;
      res.msg = 'logout success!!';
    } else {
      res.msg = 'logout fail!!';
    }
    ctx.body = res
  }

  @post('register')
  async register(ctx) {
    const res = Object.assign({}, this.commonResponse)
    const data = ctx.request.body;
    if (data.name && data.user && data.pwd) {
      const result = await this.registerAccount(data.name, data.user, md5(data.pwd), 'pc', '');
      // console.log(result);
      if (result && result.id) {
        res.data = result.id;
        res.msg = result.msg;
        res.status = 0;
      }
    }
    ctx.body = res;
  }

  @authorize()
  @get('search')
  async searchArticleByKey(ctx) {
    const res = Object.assign({}, this.commonResponse)
    ctx.accepts('application/json')
    if (ctx.query.key) {
      const req = await this.getArticleByKey(ctx.query.key as string);
      res.data = req;
    }
    ctx.body = res;
  }

  @authorize()
  @get('get_file_by_file_id')
  async searchArticleById(ctx) {
    const res = Object.assign({}, this.commonResponse)
    ctx.accepts('application/json')
    if (ctx.query.id) {
      const req = await this.getArticleByArticleId(ctx.query.id as string);
      res.data = req;
    }
    ctx.body = res;
  }

  @authorize()
  @post('move_content')
  async moveContentByParentId(ctx: IContext) {
    const res = Object.assign({}, this.commonResponse)
    const data = ctx.request.body
    if (data && data.id && data.parentId && data.id !== data.parentId && data.sort) {
      const resp = await this.moveContent(data.id, data.parentId, data.sort)
      if (resp.data) {
        res.data = resp.data;
        res.msg = 'success'
      } else {
        res.data = null
        res.msg = 'error'
      }
    } else {
      res.data = null
      res.msg = 'params error'
      res.status = 500
    }
    ctx.body = res
  }
  
  async insertContent<T>(name: string, type: fileType, parentId: number) {
    const res = Object.assign({}, this.commonResponse)
    try {
      const data = await NotebookModel.insertContent<IInsertRes, string[]>([`('${name}', '${type}', '${parentId}')`])
      res.data = {
        id: data.insertId
      }
      res.msg = 'success'
    } catch (error) {
      res.status = 500
      res.msg = error
    }
    return {...res}
  }

  async deleteContent(id: string) {
    const res = Object.assign({}, this.commonResponse)
    try {
      const data = await NotebookModel.deleteContent<IUpdateRes, string>(id)
      res.data = data
      res.msg = 'success'
    } catch (error) {
      res.status = 500
      res.msg = error
    }
    return {...res}
  }

  async updateContentTitle(name: string, id: string) {
    const res = Object.assign({}, this.commonResponse)
    try {
      const data = await NotebookModel.updateContentTitle<IUpdateRes>(name, id)
      res.data = data
      res.msg = 'success'
    } catch (error) {
      res.status = 500
      res.msg = error
    }
    return {...res}
  }

  async getContentTreeData() {
    const res = Object.assign({}, this.commonResponse)
    const data = []
    await NotebookModel.selectContentTree()
      .then((resp) => {
        if (Array.isArray(resp)) {
          resp.forEach((item) => {
            data.push({
              id: item.id,
              name: item.name,
              type: item.type,
              parent: item.parent,
              serial: item.serial,
              create_time: item.create_time,
            })
          })
        }
        res.msg = 'success'
      })
      .catch((error) => {
        res.data = error
        res.msg = 'fail'
        res.status = 500
      })
    return {...res, data}
  }

  async createArticle(contentId: string, value: string) {
    let data = null
    try {
      const createResp = await NotebookModel.createArticle<IInsertRes>(value)
      // console.log('createResp', createResp);

      if (createResp.insertId) {
        const relationResp = await NotebookModel.createRelationship<IInsertRes>(contentId, createResp.insertId);
        // console.log('relationResp', relationResp)
        if (relationResp.insertId) {
          data = {
            article_id: createResp.insertId,
            msg: 'ok'
          }
        }
      }
    } catch (error) {
      console.log(error);
      throw('error!!!')
    }
    return data;
  }

  async saveArticle<T>(articleId: string, value: string) {
    let data = null
    try {
      const resp = await NotebookModel.saveArticle<IUpdateRes>(articleId, value)
      // console.log(resp);
      if (resp.changedRows === 1) {
        data = {
          msg: 'ok'
        }
      }
    } catch (error) {
      console.log(error);
      throw('error!!!')
    }
    return data;
  }

  async getArticle<T>(id: string) {
    let data = null
    try {
      const resp = await NotebookModel.getArticle<T>(id)
      if (Array.isArray(resp) && resp.length === 1) {
        data = {
          id: resp[0].content_id,
          article_id: resp[0].article_id,
          content: resp[0].content,
          create_time: resp[0].create_time,
          update_time: resp[0].update_time,
        }
      }
    } catch (error) {
      console.log(error);
      throw('error!!!')
    }
    return data;
  }
  
  async getArticleByKey<T>(key: string) {
    let data = []
    try {
      const resp = await NotebookModel.getArticleByKey<T>(key)
      if (Array.isArray(resp) && resp.length > 0) {
        data = resp;
      }
    } catch (error) {
      console.log(error);
      throw('error!!!')
    }
    return data;
  }

  async getArticleByArticleId<T>(id: string) {
    let data = []
    try {
      const resp = await NotebookModel.getArticleByArticleId<T>(id)
      if (Array.isArray(resp) && resp.length === 1) {
        data = resp[0];
      }
    } catch (error) {
      console.log(error);
      throw('error!!!')
    }
    return data;
  }

  async registerAccount(name: string, account: string, pwd: string, endPoint: string, session: string) {
    let data = null
    try {
      const resp = await NotebookModel.registerAccount<IInsertRes>(name, account, pwd, endPoint, session)
      // console.log(resp);
      if (resp.affectedRows === 1) {
        data = {
          id: resp.insertId,
          msg: 'ok'
        }
      }
    } catch (error) {
      console.log(error);
      throw('error!!!')
    }
    return data;
  }

  async loginAccount<T>(account: string, pwd: string) {
    let data = null
    try {
      const resp = await NotebookModel.loginAccount<T>(account, pwd)
      // console.log(resp);
      if (Array.isArray(resp) && resp.length === 1 && resp[0]['count'] >= 1) {
        data = {
          code: 0,
          msg: 'ok'
        }
      } else {
        data = {
          code: -1,
          msg: 'fail'
        }
      }
    } catch (error) {
      console.log(error);
      throw('error!!!')
    }
    return data;
  }

  async moveContent<T>(id: number, parentId: number, sort: number) {
    const res = Object.assign({}, this.commonResponse)
    try {
      const data = await NotebookModel.moveContent<IUpdateRes>(id, parentId, sort)
      res.data = data
      res.msg = 'success'
    } catch (error) {
      res.status = 500
      res.msg = error
    }
    return {...res}
  }
}