const { BM, TempStorage } = require('base-model-jh');

class BiModule extends BM {
  constructor(dbInfo) {
    super(dbInfo);

    this.TempStorage = TempStorage;
  }

  /**
   * 저장소에 저장된 내역을 기준으로 insert, update 수행 후 Promise 반환
   * @param {TempStorage} storage TempStroage Class Object
   * @param {string} tblName
   * @param {string[]} updateKeyList
   * @return {Promise}
   */
  async doQuery(storage, tblName, updateKeyList, hasViewQuery) {
    const finalStorage = storage.getFinalStorage();
    // BU.CLI(finalStorage);
    await this.setTables(tblName, finalStorage.insertObjList, hasViewQuery);
    await this.updateTablesByPool(tblName, updateKeyList, finalStorage.updateObjList, hasViewQuery);

    return true;
  }

  /**
   * DB에 저장된 일기예보 추출
   * @param {number} seq
   */
  getPrevWeatherCast(seq) {
    const sql = `SELECT * FROM wc_kma_data WHERE applydate > CURDATE() AND weather_location_seq = ${seq} ORDER BY kma_data_seq DESC  LIMIT 24`;

    return this.db.single(sql, '', false);
  }

  // Controller에서 요청 시
  // TODO 예전에 쓰던 내일 우천 확율 구하기.
  getTomorrowPop(controllerNum) {
    let sql = ' SELECT Max(pop) Max FROM';
    sql += ' (';
    sql += ' SELECT A.saltern_info_seq, A.weather_location_seq ';
    sql +=
      ' ,(SELECT B.x FROM weather_location B WHERE B.weather_location_seq = A.weather_location_seq) x';
    sql +=
      ' ,(SELECT B.y FROM weather_location B WHERE B.weather_location_seq = A.weather_location_seq) y';
    sql += ' FROM saltern_info A ';
    sql += ` WHERE A.saltern_info_seq = ${controllerNum} `;
    sql += ' ) C';
    sql += ' LEFT OUTER JOIN kma_data D ON C.x = D.x AND D.y = C.y';
    sql += " WHERE DATE_FORMAT(applydate, '%Y-%m-%d') = DATE_ADD(CURDATE(), INTERVAL 1 DAY)";

    return this.db.single(sql);
  }
}
module.exports = BiModule;
