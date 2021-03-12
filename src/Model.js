const _ = require('lodash');

const { BU } = require('base-util-jh');
const BiModule = require('./BiModule');

const Control = require('./Control');

require('./format');

class Model {
  /** @param {Control} controller */
  constructor(controller) {
    this.weatherLocationSeq = controller.config.locationSeq;
    this.locationInfo = controller.config.locationInfo;

    // 원데이터는 아님. {x, y, announceData, weathercast} 내장
    this.weatherCastData = {};
    this.biModule = new BiModule(controller.config.dbInfo);
  }

  /**
   * 기상청 날씨 정제
   * @param {{x: number, y: number, announceDate: Date, weatherCast: Array.<weathercast>}} weatherCastData
   */
  async onData(weatherCastData) {
    const tempStorage = new this.biModule.TempStorage();
    const prevForecastList = await this.biModule.getPrevWeatherCast(this.weatherLocationSeq);

    _(prevForecastList).forEach(currentItem =>
      _.set(currentItem, 'applydate', BU.convertDateToText(currentItem.applydate)),
    );
    tempStorage.setExistStorage(prevForecastList);

    weatherCastData.weatherCast.forEach(currentItem => {
      // FK 확장
      _.assign(currentItem, { weather_location_seq: this.weatherLocationSeq });
      tempStorage.addStorage(currentItem, 'applydate', 'kma_data_seq');
    });
    this.weatherCastData = weatherCastData;

    const finalStorage = tempStorage.getFinalStorage();
    const writedate = BU.convertDateToText(new Date());
    finalStorage.insertObjList.forEach(currentItem => {
      _.assign(currentItem, { writedate });
    });

    const resultDoQuery = await this.biModule.doQuery(
      tempStorage,
      'wc_kma_data',
      ['kma_data_seq'],
      false,
    );
    return resultDoQuery;
  }

  // NOTE 차후 내일 강수량을 얻어올 필요가 있다면 수정 필요
  // get tomorrowPop() {
  //   let currDate = new Date();
  //   if (BU.isEmpty(this.weatherCastData)) {
  //     BU.log('empty');
  //     return {};
  //   } else {
  //     let now = new Date();
  //     let startDate = BU.convertDateToText(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  //     let endDate = BU.convertDateToText(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2));

  //     let forecastList = this.weatherCastData.weatherCast;
  //     let pop = 0;
  //     let popCount = 0;
  //     for (let key in forecastList) {
  //       if (forecastList[key].applydate >= startDate && forecastList[key].applydate < endDate) {
  //         popCount += 1;
  //         pop += Number(forecastList[key].pop);
  //       }
  //     }
  //     return Math.round(pop / popCount);
  //   }
  // }
}

module.exports = Model;
