import mysql from 'mysql'
import {MYSQL_CONFIG, MYSQL_CONFIG_DEV} from './mysql_config'

const pool = mysql.createPool({
  user: MYSQL_CONFIG.user,
  password: MYSQL_CONFIG.password,
  database: MYSQL_CONFIG.database,
  host: MYSQL_CONFIG.host,
  port: MYSQL_CONFIG.port,
  timezone: MYSQL_CONFIG.timezone
})

const query = <T, U>(sql: string, values?: U): Promise<T> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err)
      } else {
        // console.log('sql', sql)
        // https://www.npmjs.com/package/mysql
        // values 是 传给sql的参数值，select * from xx where id=? and name=?, [id, name]
        connection.query(sql, Object.values(values || {}), (err, fields) => {
          if (err) reject(err)
          else resolve(fields)
          connection.release()
        })
      }
    })
  })
}

export default query
