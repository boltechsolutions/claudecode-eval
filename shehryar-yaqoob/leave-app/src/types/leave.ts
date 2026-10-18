export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveRequest = {
  id: string;
  name: string;
  dates: string;
  status: LeaveStatus;
};

export type UndoEntry = {
  requestId: string;
  previousStatus: LeaveStatus;
};

export type UndoAction = {
  entries: UndoEntry[];
};
