import type { Category, Course, Instructor, MeetingStatus } from "./domain";

/** A course as lists need it. The long text is loaded only on its own page. */
export interface CatalogueCourse extends Omit<Course, "description" | "outcomes"> {
  seatsTaken: number;
  meetingStatus: MeetingStatus;
  completed: boolean;
}

export interface Catalogue {
  courses: CatalogueCourse[];
  categories: Category[];
  instructors: Instructor[];
}
