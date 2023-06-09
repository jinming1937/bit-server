import query from './query'

export class LoggerModel {

  static record<T, U>(controller_name: string, action_name: string, content: string) {
    const _sql = `INSERT INTO logger (\`controller_name\`, \`action_name\`, \`content\`) VALUES  (?, ?, ?)`
    return query<T, unknown>(_sql, [controller_name, action_name, content])
  }
}