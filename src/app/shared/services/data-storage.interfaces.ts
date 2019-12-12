export interface RaceSession {
  self: string;
  name: string;
  startTime: Date;
  available: boolean;
  status: string;
  contentUri?: string;
  fullStreamUrl?: string;
  imagePath?: string;
}

export interface RaceWeekend {
  name: string;
  startDate: Date;
  endDate: Date;
  sessions: RaceSession[];
  imagePath?: string;
}

export interface Season {
  name: string;
  year: number;
  raceWeekends: RaceWeekend[];
  imagePath?: string;
}
