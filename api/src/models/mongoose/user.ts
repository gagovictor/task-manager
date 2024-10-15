import { Schema, model, Document } from 'mongoose';

export interface IMongooseUser extends Document {
  username: string;
  password: string;
  email: string;
  passwordResetToken: string | null;
  passwordResetExpires: number | null;
}

const userSchema = new Schema<IMongooseUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordResetToken: { type: String, required: false, nullable: true },
  passwordResetExpires: { type: Number, required: false, nullable: true },
});

export const MongooseUser = model<IMongooseUser>('User', userSchema);