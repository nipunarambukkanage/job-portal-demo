import type { ChipProps } from "@mui/material";

export enum ApplicationStatus {
  Submitted = 0,
  Reviewed = 1,
  Interview = 2,
  Offered = 3,
  Rejected = 4,
  Withdrawn = 5,
  New = 6,
}

export interface JobSummary {
  id: string;
  title: string;
  company: string;
  location: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId?: string;
  status: ApplicationStatus;
  createdAtUtc?: string;
  resumeUrl?: string | null;
  coverLetter?: string | null;
  job?: JobSummary;
}

export const statusText = (s: ApplicationStatus) => ApplicationStatus[s] ?? 'Unknown';

export const statusColor = (s: ApplicationStatus): ChipProps['color'] => {
  switch (s) {
    case ApplicationStatus.Submitted:
      return 'info';
    case ApplicationStatus.Reviewed:
      return 'primary';
    case ApplicationStatus.Interview:
      return 'warning';
    case ApplicationStatus.Offered:
      return 'success';
    case ApplicationStatus.Rejected:
      return 'error';
    case ApplicationStatus.Withdrawn:
    default:
      return 'default';
  }
};
