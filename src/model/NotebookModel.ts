import query from './query'

export class NotebookModel {

  static insertContent<T, U>(name: string, type: string, parentId: number, sort: number) {
    const _sql = `INSERT INTO content_tree (\`name\`, \`type\`, \`parent\`, \`serial\`) VALUES  (?, ?, ?, ?)`
    return query<T, unknown>(_sql, [name, type, parentId, sort])
  }

  static deleteContent<T, U>(value: string) {
    // 删除会把子节点也删除
    // 软删
    const _sql = `UPDATE content_tree SET is_del=1 where id=? or parent=?`
    return query<T, string[]>(_sql, [value, value])
  }

  static getSerial<T>(parentId: number) {
    const _sql = `select \`serial\` from content_tree where  is_del = 0 and parent = ? order by \`serial\` desc limit 0, 1;`
    return query<T, number[]>(_sql, [parentId])
  }

  static moveContentById<T>(id: number, parentId: number, sort: number) {
    const _sql = `UPDATE content_tree SET parent=?, serial=? where id=?`
    return query<T, number[]>(_sql, [parentId, sort, id])
  }

  static moveContent<T>(id: number, parentId: number, sort: number) {
    // const _sql = `UPDATE content_tree SET parent=?, serial=? where id=?`
    const _sql = `
    select (@serial:=\`serial\`) from content_tree where is_del = 0 and parent = ? order by \`serial\` desc limit 0, 1;
    UPDATE content_tree SET parent=?, serial=(@serial+1) where id=? 
    `
    return query<T, number[]>(_sql, [parentId, parentId, id])
  }

  static updateContentTitle<T>(name: string, id: string) {
    const _sql = `UPDATE content_tree SET name=? where id=?`
    return query<T, unknown>(_sql, [name, id])
  }
  
  static selectContentTree<T, U>(): Promise<T> {
    const _sql = `SELECT id, \`name\`, \`type\`, parent, \`serial\` FROM content_tree WHERE is_del = 0 and type = "content" order by serial desc, create_time desc`
    return query<T, unknown>(_sql, [])
  }

  /**
   * 跟据目录Id 查找文件
   * @param contentId 目录Id
   * @returns 
   */
  static getArticle<T>(contentId: string): Promise<T> {
    const _sql = `
    SELECT content_id, article_id, content, article.create_time, article.update_time FROM content_article
    LEFT JOIN article ON content_article.article_id = article.id
    WHERE content_article.content_id = ? 
    `
    return query<T, unknown>(_sql, [contentId]);
  }
  
  static getArticleByKey<T>(key: string): Promise<T> {
    // 防注入
    const _sql = `select id, content from article where content like "%${key}%" order by create_time desc`
    return query<T, unknown>(_sql, [key]);
  }

  static getArticleByContent<T>(parentId: number): Promise<T> {
    // 防注入
    const _sql = `select id, \`name\`, \`type\`, parent, \`serial\` from content_tree where is_del = 0 and parent = ? order by serial desc, create_time desc`
    return query<T, unknown>(_sql, [parentId]);
  }

  /**
   * 文章IdId 查找文章
   * @param id 文章Id
   * @returns 
   */
  static getArticleByArticleId<T>(id: string): Promise<T> {
    // 防注入
    const _sql = `select id, content from article where id = ?`
    return query<T, unknown>(_sql, [id]);
  }

  static createArticle<T>(value: string): Promise<T> {
    const _sql = `INSERT INTO article (\`content\`) VALUES (?)`
    return query<T, unknown>(_sql, [value]);
  }

  static createRelationship<T>(contentId: string, articleId: number) {
    const _sql = `INSERT INTO content_article (content_id, article_id) VALUES (?, ?)`
    return query<T, unknown>(_sql, [contentId, articleId]);
  }

  static saveArticle<T>(articleId: string, value: string): Promise<T> {
    const _sql = `update article set content = ? where id = ?`
    return query<T, unknown>(_sql, [value, articleId]);
  }

  static registerAccount<T>(name: string, account: string, pwd: string, endPoint: string, session: string): Promise<T> {
    const _sql = `insert into account (\`name\`, \`account\`, \`password\`, end_point, \`session\`) values (?, ?, ?, ?, ?)`;
    return query<T, unknown>(_sql, [name, account, pwd, endPoint, session]);
  }

  static loginAccount<T>(account: string, pwd: string): Promise<T> {
    const _sql = `select count(*) as \`count\` from account where account = ? and password = ?`;
    return query<T, unknown>(_sql, [account, pwd]);
  }

  static checkContent<T>(): Promise<T> {
    const _sql = `select ct1.id, ct1.name as contentName, ct1.parent as contentParent, ct1.type, ct2.name as fileName, ct2.id as fileId, ct2.type as parentType 
    from content_tree ct1 left join content_tree ct2 on ct1.parent = ct2.id 
    where ct1.type = "content" and ct2.type="file"`
    return query<T, unknown>(_sql, []);
  }

  // static loginAccountBySession<T>(account: string, pwd: string): Promise<T> {
  //   const _sql = `select count(*) from account where account = ? and password = ?`;
  //   return query<T, unknown>(_sql, [account, pwd]);
  // }
}
// today table -- 今天数据
// backup table -- 14天数据
