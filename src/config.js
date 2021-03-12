module.exports = {
  hasDev: false,
  /** @property {{x: number, y: number}} locationInfo 위도, 경도 */
  locationSeq: 2659,
  locationInfo: {
    x: 50,
    y: 71,
  },
  /** @property  접속 host, id, pw, database */
  dbInfo: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PW,
    database: process.env.DB_DB,
  },
};
