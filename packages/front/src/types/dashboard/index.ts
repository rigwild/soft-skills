export enum AnalysisState {
  PENDING = "pending",
  ERROR = "error",
  SUCCESS = "finished",
}

export type Upload = {
  _id: string;
  name: string;
  analysisId: string;
  videoFile: string;
  state: AnalysisState;
  uploadTimestamp: string;
  lastStateEditTimestamp: string;
  errorMessage?: string;
};
