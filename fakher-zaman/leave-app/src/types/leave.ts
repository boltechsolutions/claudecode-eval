export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveRequest = {
  id: string;
  name: string;
  dates: string;
  status: LeaveStatus;
};
