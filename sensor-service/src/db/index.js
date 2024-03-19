const mongoose = require('mongoose');
const connUri = process.env.MONGO_CONN;

async function connectMongoose() {
  try {
    await mongoose.connect(connUri);
    console.log('Mongoose connected');
  } catch (e) {
    console.log(`Error connecting to mongoose: ${e}`);
  }
}

async function initialLoad() {
  await connectMongoose();
}

initialLoad();
