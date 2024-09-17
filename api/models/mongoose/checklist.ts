import { Schema } from "mongoose";
import { ChecklistItem } from "../checklist";

export const checklistItemSchema = new Schema<ChecklistItem>({
    id: { type: String, required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, required: true },
});