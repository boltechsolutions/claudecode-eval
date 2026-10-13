export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveRequest = {
  id: string;
  name: string;
  dates: string;
  status: LeaveStatus;
};

export type StatusChange = {
  id: string;
  previousStatus: LeaveStatus;
};

// One undoable action: a single approve/reject is a batch of one, "Approve all" a batch of many.
export type HistoryEntry = StatusChange[];
