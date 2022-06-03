import dotenv from "dotenv";
dotenv.config();
import * as performDaily from "./src/perform-daily.js";
import cron from "node-cron";

const performfluid = "fluidsynth -F kletis3.wav  -i -n -T wav kirby.sf2 midi.mid";
//use cron to run every 3 minutes

//use cron to run every 20 minutes
cron.schedule("*/20 * * * *", () => {
  console.log("running a task every 20 minutes");
  //console log current time
  console.log(new Date());
  //perform daily
  performDaily.everyDay();
});

// cron.schedule(
//   "0 5 * * *",
//   () => {
//     console.log("Nu händer det.")
//     console.log("Running a job at 00:05");
//     performDaily.everyDay();
//   },
//   {
//     scheduled: true,
//     timezone: "Europe/Stockholm",
//   }
// );

performDaily.everyDay();
