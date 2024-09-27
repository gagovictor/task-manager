export interface ICosmosTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  checklist?: string;
  dueDate?: Date;
  status?: string;
  createdAt: Date;
  modifiedAt?: Date;
  archivedAt?: Date;
  deletedAt?: Date;
}