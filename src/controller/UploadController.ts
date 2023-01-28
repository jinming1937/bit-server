import BaseController from './BaseController'
import {IContext} from '../common/types'
import {controller, post} from '../middleware/decorator'
import formidable from 'formidable';

@controller('/api/upload/')
export default class UploadController extends BaseController {
  
  @post('img')
  async upload(ctx: IContext) {
    const res = Object.assign({}, this.commonResponse)
    var form = formidable({multiples: true, uploadDir: `${__dirname}/../../static/`, keepExtensions: true, encoding: 'utf-8'});
    // form.encoding = "utf-8";
    // form.keepExtensions = true; //保留后缀名
    // form.uploadDir = `${__dirname}/../../static/`; //上传路径
    // form.multiples = true; //多图上传
    try {
      const result = await new Promise<{fileNames: string[], status: number, e?: any}>((resolve, reject) => {
        //多文件存储到 files
        var saveFiles = [];
        const fileNames: string[] = [];
        form.on("file", function (filed, file) {
          console.log('file event');
          saveFiles.push([filed, file]);
        });
        //解析form表单 fields 为表单中非文件内容   files 为文件信息
        form.parse(ctx.req, function (err, fields, files) {
          if (err) {
            reject({fileNames: [''], status: 0, e: err})
            return;
          }
          const {img: uploadImage} = files;
          if (!uploadImage) {
            console.log('Can not get files from params:img!!!');
            reject({fileNames: [''], status: 0, e: 'error! Can not get files from params:img!!!'})
            return;
          }
          //单文件
          if (typeof uploadImage.length === "undefined") {
            fileNames.push(uploadImage.newFilename)
          } else {
            //多文件
            for (let i = 0; i < uploadImage.length; i++) {
              let aimPath = uploadImage[i].path.replace(/static/g, "");
              fileNames.push(aimPath)
            }
          }
        });
        form.on('end', () => {
          resolve({fileNames, status: 200});
        });
        form.on('error', (e) => {
          reject({fileNames: [''], status: 0, e: e});
          console.log('error');
        })
      }) 
      res.msg = result.status ? 'success' : 'error';
      res.status = result.status;
      res.data = result.fileNames;
    } catch (error) {
      console.log(error);
      res.status = 500;
      res.msg = 'erorr! 出错了';
    }
    
    ctx.body = res;
  }
}
