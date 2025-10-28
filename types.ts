export enum LogType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
}

export interface LogEntry {
  timestamp: Date;
  message: string;
  type: LogType;
}