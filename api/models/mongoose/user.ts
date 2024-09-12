import { Schema, model, Document } from 'mongoose';

export interface IMongooseUser extends Document {
  username: string;
  password: string;
  email: string;
}

const userSchema = new Schema<IMongooseUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});

export const MongooseUser = model<IMongooseUser>('User', userSchema);