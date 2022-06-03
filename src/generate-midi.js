import cloudinary from 'cloudinary';
import fs from "fs";
import MidiWriter from 'midi-writer-js';
import lodash from "lodash";
import streamifier from "streamifier";
import axios from "axios";
import * as mongo from "./data-fetcher.js";
import Midi from 'jsmidgen'
import { exec } from "child_process";
import dropboxV2Api from 'dropbox-v2-api';

export const setupCloudinary = () => {
  cloudinary.v2.config(
    {
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET
    });
}

export async function generateMidi(
  data,
  tempHigh,
  tempLow,
  humHigh,
  humLow,
  pressHigh,
  pressLow,
  startTimeString,
  timeString
) {
  //get last days date
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  var lastDay = `${month}-${day}-${year}`;
  // get yeasterdays date
  var date = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  var yesterday = `${month}-${day}-${year}`;
  const noteArray = ["C3", "D3", "E3", "G3", "A3"];
  const noteArray2 = [48, 50, 52, 55, 57];
  console.log("performMidi");
  let length;
  length = data.length / 64;
  // divide tempHigh and tempLow into 5 parts with min and max
  let tempDivider = (tempHigh - tempLow) / 5;
  let humDivider = (humHigh - humLow) / 5;
  let pressDivider = (pressHigh - pressLow) / 5;
  await new Promise(resolve => setTimeout(resolve, 1000));
  let tresholdsTemp = [
    { low: tempLow, high: tempLow + tempDivider },
    { low: tempLow + tempDivider, high: tempLow + 2 * tempDivider },
    { low: tempLow + 2 * tempDivider, high: tempLow + 3 * tempDivider },
    { low: tempLow + 3 * tempDivider, high: tempLow + 4 * tempDivider },
    { low: tempLow + 4 * tempDivider, high: tempHigh },
  ];
  let tresholdsHum = [
    { low: humLow, high: humLow + humDivider },
    { low: humLow + humDivider, high: humLow + 2 * humDivider },
    { low: humLow + 2 * humDivider, high: humLow + 3 * humDivider },
    { low: humLow + 3 * humDivider, high: humLow + 4 * humDivider },
    { low: humLow + 4 * humDivider, high: humHigh },
  ];
  let tresholdsPress = [
    { low: pressLow, high: pressLow + pressDivider },
    { low: pressLow + pressDivider, high: pressLow + 2 * pressDivider },
    { low: pressLow + 2 * pressDivider, high: pressLow + 3 * pressDivider },
    { low: pressLow + 3 * pressDivider, high: pressLow + 4 * pressDivider },
    { low: pressLow + 4 * pressDivider, high: pressHigh },
  ];
  let track1 = [];
  let track2 = [];
  let track3 = [];
  let notes1 = [];
  let notes2 = [];
  let notes3 = [];
  // pause running for 1 second

  await new Promise(resolve => setTimeout(resolve, 1000));


  for (let i = 0; i < data.length; i++) {
    if (i) {
      //check what range temp is in
      for (let j = 0; j < tresholdsTemp.length; j++) {
        if (
          data[i].temperature >= tresholdsTemp[j].low &&
          data[i].temperature <= tresholdsTemp[j].high
        ) {
          // console.log("apansson")
          track1.push(j);
          let random = Math.random() * (1 - 0.5) + 0.5;

          notes1.push({
            name: noteArray[j],
            midi: noteArray2[j],
            time: j + 1,
            velocity: random,
            duration: 1,
          });
        }
      }
      //check what range hum is in
      for (let j = 0; j < tresholdsHum.length; j++) {
        if (
          data[i].humidity >= tresholdsHum[j].low &&
          data[i].humidity <= tresholdsHum[j].high
        ) {
          // get a random nuymber between 0.5 and 1
          let random = Math.random() * (1 - 0.5) + 0.5;

          track2.push(j);
          notes2.push({
            name: noteArray[j],
            midi: noteArray2[j],
            time: j + 1,
            velocity: random,
            duration: 1,
          });

        }
      }
      //check what range press is in
      for (let j = 0; j < tresholdsPress.length; j++) {
        if (
          data[i].pressure >= tresholdsPress[j].low &&
          data[i].pressure <= tresholdsPress[j].high
        ) {
          track3.push(j);
          let random = Math.random() * (1 - 0.5) + 0.5;
          notes3.push({
            name: noteArray[j],
            midi: noteArray2[j],
            time: j + 1,
            velocity: random,
            duration: 1,
          });
        }
      }
    }
  }
  let file = new Midi.File();

  let track01 = new Midi.Track();
  let track02 = new Midi.Track();
  let track03 = new Midi.Track();
  file.addTrack(track01);
  file.addTrack(track02);
  file.addTrack(track03);
  track01.setInstrument(0, 1).setTempo(60);
  track02.setInstrument(0, 1).setTempo(60);
  track03.setInstrument(0, 1).setTempo(60);
  for (let i = 0; i < 24; i++) {
    track01.addNote(0, notes1[i].name, 64);
    track02.addNote(0, notes2[i].name, 64);
    track03.addNote(0, notes3[i].name, 64);
  }


  fs.writeFileSync(`${startTimeString}.mid`, file.toBytes(), 'binary');

  let performfluid = `fluidsynth -F ${startTimeString}.wav  -i -n -T wav italo.sf2 ${startTimeString}.mid`;
  // Execute the command
  exec(performfluid, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
  let performSox = `sox ${startTimeString}.wav ${startTimeString}.mp3`;
  // Execute the command
  await new Promise(resolve => setTimeout(resolve, 13000));


  exec(performSox, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
  // use sox to add echo
  let performEcho = `sox ${startTimeString}.mp3 ${startTimeString}Echo.mp3 echo 0.8 0.88 60 0.4`;
  // Execute the command
  await new Promise(resolve => setTimeout(resolve, 3000));
  exec(performEcho, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
  // use sox to add reverb
  let performReverb = `sox ${startTimeString}Echo.mp3 ${startTimeString}Reverb.mp3 reverb 0.5`;
  // Execute the command
  await new Promise(resolve => setTimeout(resolve, 3000));
  exec(performReverb, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });


  //////////////// Dropbox
  let dropboxToken = process.env.DROPBOX_TOKEN;
  const dropbox = dropboxV2Api.authenticate({
    token: dropboxToken
});

const dropboxUploadStream = dropbox({
  resource: 'files/upload',
  parameters: {
    path: '/dropbox/testfolder/' + startTimeString + '.mp3',
    autorename: true,
    mute: false

  }
}, (err, result, response) => {
  // console.log("result ",result);
  // console.log("err ", err);
  // console.log("response ", response);
});

fs.createReadStream(`${startTimeString}Reverb.mp3`).pipe(dropboxUploadStream);
  

  //delete files
  let deleteFiles = `rm ${startTimeString}.wav ${startTimeString}.mid ${startTimeString}Echo.mp3 ${startTimeString}Reverb.mp3`;
  // Execute the command
  await new Promise(resolve => setTimeout(resolve, 3000));
  exec(deleteFiles, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

  let audioLink = "https://www.dropbox.com/s/kczsbonis2qp1uu/" + `${startTimeString}Reverb.mp3`;
  let mongoAudioData = {  
    audioLink: audioLink,
    audioName: `${startTimeString}Reverb.mp3`,
    audioDate: timeString,
    time: date.getTime()
  };
  mongo.saveUrlToMongo(mongoAudioData);

}