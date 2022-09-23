import * as mongoose from "mongoose";

// allow empty strings when required is true
mongoose.Schema.Types.String.checkRequired(v => typeof v === "string");

export async function connectToDatabase() {
    console.log(process.env.DB_CONN_STRING);
    await mongoose.connect(process.env.DB_CONN_STRING || "")
    
    console.log(`Sucessfully connected to database`);
};
