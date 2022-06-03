import { MongoClient } from "mongodb";
import mongoose from "mongoose";
 
 export async function connectDbAndExtractData() {
  const mongoString = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@iotcluster.pfotz.mongodb.net/UserData?retryWrites=true&w=majority`;
  try {
    const client = await MongoClient.connect(mongoString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db("UserData");
    const col = db.collection("python");
    const data = await col.find({}).toArray();
    // console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
}
//save url to moongodb atlas as a collection audio
export async function saveUrlToMongo(url) {
  const mongoString = `mongodb+srv://${process.env.MONGO_USER}:${
    process.env.MONGO_PW
  }@iotcluster.pfotz.mongodb.net/UserData?retryWrites=true&w=majority`;
  try {
    const client = await MongoClient.connect(mongoString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db("UserData");
    const col = db.collection("audio");
    const data = await col.insertOne( url );
    return data;
  } catch (error) {
    console.log(error);
  }
}