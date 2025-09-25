//@ts-nocheck
import mongoose from 'mongoose';

export default async function dbConnect(){
    mongoose.connect(process.env.MONGODB_URI || '', {
        dbName: "Grimoire",
      }).catch(err => console.error('Database connection error:', err));
};