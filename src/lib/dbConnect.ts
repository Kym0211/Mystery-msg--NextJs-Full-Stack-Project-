import { log } from "console";
import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if(connection.isConnected){
        log("Already connected to database")
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {})

        // log(db);
        connection.isConnected = db.connections[0].readyState
        log("DB Connected Successfully")
    } catch (error) {
        log("DB Connection Error: ", error)
        process.exit()
    }
}

export default dbConnect;