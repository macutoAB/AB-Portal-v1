export enum UserRole {
  ADMIN = 'admin',
  GUEST = 'guest',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum Semester {
  A = 'A',
  B = 'B',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  password?: string; // Included for mock database storage purposes
}

export interface Member {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  gender: Gender;
  batchYear: string;
  batchName: string;
  idNumber: string;
  semester: Semester;
  chapter: string;
  school: string; // Added school field for "Members per school" stat
  dateCreated: string;
  dateUpdated: string;
}

export interface Organizer {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  batchYear: string;
  idNumber: string;
  chapter: string;
  school: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface Affiliate {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  batchYear: string;
  idNumber: string;
  chapter: string;
  school: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface GrandChancellor {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  year: string;
  term: string;
  type: 'GC' | 'GLC';
  dateCreated: string;
  dateUpdated: string;
}

export interface ContentPage {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  date: string;
  title: string;
  description: string;
  category: 'Fraternity' | 'Sorority';
  dateCreated: string;
}

// Helper for charts
export interface ChartData {
  name: string;
  value: number;
}