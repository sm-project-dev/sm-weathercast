const xml2js = require('xml2js');
const cron = require('node-cron');
const https = require('https');
const _ = require('lodash');

const { BU } = require('base-util-jh');

const Control = require('./Control');

require('./format');

class PWeatherCast {
  /** @param {Control} controller */
  constructor(controller) {
    this.controller = controller;
    this.locationX = controller.config.locationInfo.x;
    this.locationY = controller.config.locationInfo.y;

    this.cronScheduler = null;
  }

  // Cron 구동시킬 시간
  runCronWeatherCast() {
    if (this.cronScheduler !== null) {
      this.cronScheduler.stop();
    }

    // 30분마다 요청
    this.cronScheduler = cron.schedule('*/30 * * * *', () => {
      this.controller.config.hasDev
        ? this.TestRequestWeatherCastForFile()
        : this.requestWeatherCast();
    });

    this.cronScheduler.start();
    return true;
  }

  // 날씨 정보 요청
  requestWeatherCast(callback) {
    const options = {
      host: 'www.kma.go.kr',
      path: `/wid/queryDFS.jsp?gridx=${this.locationX}&gridy=${this.locationY}`,
    };

    try {
      https
        .request(options, res => {
          let output = '';
          res.setEncoding('utf8');

          res.on('data', chunk => {
            output += chunk;
          });

          res.on('end', () => {
            const parser = new xml2js.Parser();
            parser.parseString(output, (err, result) => {
              if (err) {
                return this.controller.processOnData(err);
              }
              // TestRequestWeatherCastForFile을 사용하기 위한 파일 저장
              // BU.writeFile('./log/weathercast.txt', result, 'w');
              // 모델화 시킴
              const weatherCastModel = this.makeWeatherCastModel(result, callback);
              return this.controller.processOnData(null, weatherCastModel);
            });
          });
        })
        .end();
    } catch (error) {
      BU.logFile(_.get(error, 'stack', 'requestWeatherCast'));
    }
  }

  // TEST: 테스트용 동네예보 파일 읽어오기
  TestRequestWeatherCastForFile() {
    BU.readFile('./log/weathercast.txt', '', (err, result) => {
      if (err) {
        return this.controller.processOnData(err);
      }
      const weatherCastModel = this.makeWeatherCastModel(JSON.parse(result));
      return this.controller.processOnData(null, weatherCastModel);
    });
  }

  // 현재 기상청 날씨 정보 설정
  /**
   *
   * @param {*} weatherCastInfo
   * @return {weathercastModel}
   */
  makeWeatherCastModel(weatherCastInfo) {
    if (_.get(weatherCastInfo, 'wid.header', []).length === 0) {
      throw new Error('weather data is broken');
    }
    const weatherCastObjHeader = weatherCastInfo.wid.header[0];
    const weatherCastObjBody = weatherCastInfo.wid.body[0];
    const announceDate = BU.splitStrDate(weatherCastObjHeader.tm);
    const forecastInfo = {
      x: weatherCastObjHeader.x[0],
      y: weatherCastObjHeader.y[0],
      announceDate,
      weatherCast: [],
    };

    _.forEach(weatherCastObjBody.data, castInfo => {
      let wf = 0;
      const wfEn = castInfo.wfEn[0];
      switch (wfEn) {
        case 'Clear':
          wf = 1;
          break;
        case 'Partly Cloudy':
          wf = 2;
          break;
        case 'Mostly Cloudy':
          wf = 3;
          break;
        case 'Cloudy':
          wf = 4;
          break;
        case 'Rain':
          wf = 5;
          break;
        case 'Snow/Rain':
          wf = 6;
          break;
        case 'Snow':
          wf = 7;
          break;

        default:
          break;
      }
      /** @type {weathercast} */
      const weatherCastData = {
        // day: castInfo.day[0], // 발표 날
        // hour: castInfo.hour[0], // 발표 시
        applydate: this.calcApplyDate(announceDate, castInfo), // 적용시간
        temp: castInfo.temp[0], // 날씨
        pty: castInfo.pty[0], // [없음(0), 비(1), 비 / 눈(2), 눈(3)]
        sky: castInfo.sky[0], // ① 1 : 맑음 ② 2 : 구름조금 ③ 3 : 구름많음 ④ 4 : 흐림
        wf, // ① Clear ② Partly Cloudy ③ Mostly Clou1dy ④ Cloudy ⑤ Rain ⑥ Snow/Rain ⑦ Snow
        // wf_kor: castInfo.wfKor[0], // 날씨 한국어
        // wf_en: castInfo.wfEn[0], // 날씨 영어
        pop: castInfo.pop[0], // 강수확율
        r12: castInfo.r12[0], // 12시간 예상강수량
        ws: Number(castInfo.ws[0]).toFixed(2), // 풍속
        wd: castInfo.wd[0], // 풍향
        reh: castInfo.reh[0], // 습도
      };
      forecastInfo.weatherCast.push(weatherCastData);
    });

    return forecastInfo;
  }

  // 발표 시각을 기준으로 적용중인 시간을 계산하여 Date 반환
  calcApplyDate(baseDate, targetDate) {
    const applydate = new Date(baseDate);
    const day = Number(targetDate.day[0]);
    const hour = Number(targetDate.hour[0]);

    applydate.setMinutes(0);
    applydate.setSeconds(0);
    applydate.setDate(baseDate.getDate() + day);
    applydate.setHours(hour);
    return BU.convertDateToText(applydate);
  }
}

module.exports = PWeatherCast;
