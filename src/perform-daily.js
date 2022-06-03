import * as dataFetcher from './data-fetcher.js';
import * as generateMidi from "./generate-midi.js";

export async function everyDay() {
  let count, data, humHigh, humLow, pressHigh, pressLow, tempHigh, tempLow;
  let todaysData = [];
  console.log("l\u00f6k");
  data = await dataFetcher.connectDbAndExtractData();
  // console.log(data);
  todaysData = [];
  count = 0.0;
  tempHigh = 0.0;
  tempLow = 10000.0;
  humHigh = 0.0;
  humLow = 10000.0;
  pressHigh = 0.0;
  pressLow = 10000.0;
  //get three days ago beginning time and end time in timestamp
  let threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 8);
  let threeDaysAgoStartTime = threeDaysAgo.getTime();
  let threeDaysAgoEndTime = threeDaysAgoStartTime + 24 * 60 * 60 * 1000;
  // console.log("threeDaysAgoStartTime: ", threeDaysAgoStartTime);  
  // console.log("threeDaysAgoEndTime: ", threeDaysAgoEndTime);


  //get yesterdays beginning time and end time in timestamp
  var startTime = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  // convert startTime to date and minute string
  let startTimeString = `${startTime.getMonth() + 1}-${startTime.getDate()}-${startTime.getFullYear()}${startTime.getHours()}-${startTime.getMinutes()}`;
  let timeString = `${startTime.getMonth() + 1}-${startTime.getDate()}-${startTime.getFullYear()}`;
  console.log("startTimeString: ", startTimeString);
  // let startTimeString = startTime.toISOString().slice(0, 10);


  var endTime = new Date(
    new Date().getTime() - 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000
  );
  //startTime to timesdtamp
  startTime = startTime.getTime() / 1000;
  endTime = endTime.getTime() / 1000;
  // startTime = threeDaysAgoStartTime / 1000;
  // endTime = threeDaysAgoEndTime / 1000;

  // console.log(startTime);
  // console.log(endTime);
  // console.log(data[16900].time);
  // startTime = 1651960800;
  // endTime = 1651874400.0

  for (let i = 0; i < data.length; i++) {
    //check if time is between start and end time
    // console.log(startTime, data[i].time, endTime);
    if (data[i].time > startTime && data[i].time < endTime) {
      // console.log("Yes sir, I can boogie");
      todaysData.push(data[i]);

      if (data[i].temperature > tempHigh) {
        tempHigh = data[i].temperature;
      }

      if (data[i].temperature < tempLow) {
        tempLow = data[i].temperature;
      }

      if (data[i].humidity > humHigh) {
        humHigh = data[i].humidity;
      }

      if (data[i].humidity < humLow) {
        humLow = data[i].humidity;
      }

      if (data[i].pressure > pressHigh) {
        pressHigh = data[i].pressure;
      }

      if (data[i].pressure < pressLow) {
        pressLow = data[i].pressure;
      }
    }
  }

  console.log(todaysData.length);
  generateMidi.generateMidi(
    todaysData,
    tempHigh,
    tempLow,
    humHigh,
    humLow,
    pressHigh,
    pressLow,
    startTimeString,
    timeString
  );
}