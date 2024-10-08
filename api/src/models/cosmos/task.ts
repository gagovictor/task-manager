export interface ICosmosTask {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  checklist: string | null;
  dueDate: Date | null;
  status: string;
  createdAt: Date;
  modifiedAt: Date | null;
  archivedAt: Date | null;
  deletedAt: Date | null;
}