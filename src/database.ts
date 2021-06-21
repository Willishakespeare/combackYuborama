import mongoose, { ConnectionOptions } from "mongoose";
import config from "./config/config";

const dbOptions: ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
};

mongoose.connect(config.DB.URI, dbOptions);

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("mongodb conect");
});

connection.on("warning", (e) => console.warn(e.stack));
