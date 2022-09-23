import * as mongoose from "mongoose";
import * as dotenv from "dotenv";

// allow empty strings when required is true
mongoose.Schema.Types.String.checkRequired(v => typeof v === "string");

export async function connectToDatabase() {
    dotenv.config();

    console.log(process.env.DB_CONN_STRING);
    await mongoose.connect(process.env.DB_CONN_STRING || "")
    
    console.log(`Sucessfully connected to database`);
};
