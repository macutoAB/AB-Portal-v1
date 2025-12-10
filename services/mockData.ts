import { Member, Organizer, Affiliate, GrandChancellor, Gender, Semester, User, UserRole, ContentPage, TimelineEvent } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Gate Keeper',
    email: 'admin@alphabeta.org',
    password: 'admin1963',
    role: UserRole.ADMIN,
    status: 'active'
  },
  {
    id: '2',
    name: 'Gate Keeper',
    email: 'guest@alphabeta.org',
    password: 'guest1925',
    role: UserRole.GUEST,
    status: 'active'
  }
];

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    lastName: 'Doe',
    firstName: 'John',
    middleName: 'A.',
    gender: Gender.MALE,
    batchYear: '2020',
    batchName: 'Alpha Genesis',
    idNumber: '2020-00123',
    semester: Semester.A,
    chapter: 'Alpha Beta',
    school: 'University of Science',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    lastName: 'Smith',
    firstName: 'Jane',
    middleName: 'B.',
    gender: Gender.FEMALE,
    batchYear: '2021',
    batchName: 'Beta Rising',
    idNumber: '2021-00456',
    semester: Semester.B,
    chapter: 'Alpha Beta',
    school: 'State College',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    lastName: 'Reyes',
    firstName: 'Mark',
    middleName: 'C.',
    gender: Gender.MALE,
    batchYear: '2019',
    batchName: 'Gamma Ray',
    idNumber: '2019-11223',
    semester: Semester.A,
    chapter: 'Alpha Beta',
    school: 'University of Science',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    lastName: 'Santos',
    firstName: 'Maria',
    middleName: 'D.',
    gender: Gender.FEMALE,
    batchYear: '2022',
    batchName: 'Delta Force',
    idNumber: '2022-99887',
    semester: Semester.A,
    chapter: 'Alpha Beta',
    school: 'Tech Institute',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  }
];

export const MOCK_ORGANIZERS: Organizer[] = [
  {
    id: '1',
    lastName: 'Perez',
    firstName: 'Juan',
    middleName: 'K.',
    batchYear: '2018',
    idNumber: '2018-55555',
    chapter: 'Alpha Beta',
    school: 'University of Science',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  }
];

export const MOCK_AFFILIATES: Affiliate[] = [
  {
    id: '1',
    lastName: 'Lim',
    firstName: 'Kevin',
    middleName: 'L.',
    batchYear: '2020',
    idNumber: '2020-77777',
    chapter: 'Gamma Delta',
    school: 'Other University',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  }
];

export const MOCK_CHANCELLORS: GrandChancellor[] = [
  {
    id: '1',
    lastName: 'Aquino',
    firstName: 'Robert',
    middleName: 'J.',
    year: '2023',
    term: '1st Semester',
    type: 'GC',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    lastName: 'Dizon',
    firstName: 'Sarah',
    middleName: 'M.',
    year: '2023',
    term: '1st Semester',
    type: 'GLC',
    dateCreated: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  }
];

export const MOCK_CONTENT: ContentPage[] = [
  {
    id: 'history',
    title: 'Chapter History',
    content: ``, // Deprecated in favor of TimelineEvent logic, but kept for legacy structure compatibility
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'about',
    title: 'About Us',
    content: `Alpha Phi Omega is a national coeducational service fraternity founded on the cardinal principles of Leadership, Friendship, and Service.`,
    lastUpdated: new Date().toISOString()
  }
];

export const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: '1',
    year: '1963',
    date: 'April 22, 1963',
    title: 'Initiative to Organize',
    description: 'Brothers from delta chapter (Mapua Institute of Technology) Bro. Hermegildo Abelido batch 1959 ID No. 00881 and Bro. Virgilio Varron batch 1961 ID No. 01193, took the initative to organize and constitute a chapter in Cebu Institute of Technology now called Cebu Institute of Technology-University.',
    category: 'Fraternity',
    dateCreated: new Date().toISOString()
  },
  {
    id: '2',
    year: '1963',
    date: '1963',
    title: 'First Regular Members',
    description: 'Having 19 prospects for pledgeeship all enrolled and in good standing, the petitioning chapter gained its first regular members among them was Bro. Franklin G. Calo Alpha Beta Chapter with ID No. 02399 who became the first Grand Chancellor and Pioneer of the newly constituted Chapter in Cebu.',
    category: 'Fraternity',
    dateCreated: new Date().toISOString()
  },
  {
    id: '3',
    year: '1966',
    date: 'April 17, 1966',
    title: 'Chapter Recognition',
    description: 'Cebu Institute of Technology was chartered and recognized by APO Philippines with the chapter name, Alpha Beta Chapter, The mother Chapter of Cebu',
    category: 'Fraternity',
    dateCreated: new Date().toISOString()
  },
  {
    id: '4',
    year: '2019',
    date: '2019',
    title: 'Sorority Organized',
    description: 'Make sure to include the complete names of you Sorority chapter organizers, their chapters and batches, the date when the chapter was organized and later recognized by APO Philippines.',
    category: 'Sorority',
    dateCreated: new Date().toISOString()
  }
];