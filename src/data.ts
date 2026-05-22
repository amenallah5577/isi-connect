import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Brain,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  Code2,
  GraduationCap,
  Handshake,
  LibraryBig,
  MessageCircle,
  Network,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

export type SectionId =
  | "home"
  | "resources"
  | "questions"
  | "posts"
  | "courses"
  | "connect"
  | "messages"
  | "bot"
  | "events"
  | "profile"
  | "admin";

export type AccountType = "Visitor" | "Student" | "Professor" | "Moderator" | "Admin";
export type ResourceStatus = "Approved" | "Pending" | "Flagged";

export interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
}

export interface Stat {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
}

export interface Resource {
  title: string;
  subject: string;
  year: string;
  semester: string;
  type: string;
  uploader: string;
  downloads: number;
  rating: number;
  status: ResourceStatus;
  tags: string[];
}

export interface Question {
  title: string;
  category: string;
  tags: string[];
  answers: number;
  votes: number;
  anonymous: boolean;
  solved: boolean;
  excerpt: string;
}

export interface Course {
  name: string;
  year: string;
  semester: string;
  professor: string;
  department: string;
  focus: string[];
  resources: number;
  tips: string[];
}

export interface Professor {
  name: string;
  subjects: string[];
  tone: string;
  advice: string[];
}

export interface Event {
  title: string;
  organizer: string;
  date: string;
  location: string;
  participants: number;
  type: string;
}

export interface Club {
  name: string;
  focus: string;
  members: number;
  accent: string;
}

export interface GuideItem {
  title: string;
  description: string;
  icon: LucideIcon;
  bullets: string[];
}

export interface FeedItem {
  author: string;
  role: string;
  body: string;
  tag: string;
  metric: string;
}

export interface AdminItem {
  title: string;
  count: number;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface StudentProfile {
  name: string;
  year: string;
  group: string;
  specialty: string;
  skills: string[];
  interests: string[];
  lookingFor: string;
  bio: string;
  points: number;
  status: "Online" | "Offline" | "Away" | "Studying";
}

export const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Sparkles },
  { id: "resources", label: "Resources", icon: LibraryBig },
  { id: "questions", label: "Questions", icon: CircleHelp },
  { id: "posts", label: "Posts", icon: Sparkles },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "connect", label: "Students", icon: Handshake },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "bot", label: "AI Bot", icon: Brain },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "profile", label: "Profile", icon: Users },
  { id: "admin", label: "Admin", icon: ShieldCheck },
];

export const officialFacts = {
  site: "https://isikef.rnu.tn/fr",
  name: "Institut Supérieur d'Informatique du Kef",
  address: "5 Rue Saleh Ayech - 7100 Kef",
  phone: "+216 78 201 056",
  fax: "+216 78 200 237",
  email: "contact@isikef.u-jendouba.tn",
  certification: "Certified ISO 21001",
  departments: [
    "Sciences Informatiques et Web",
    "Technologie des Réseaux Informatiques",
  ],
  licenses: ["Computer Science", "Computer Engineering"],
};

export const campusImages = [
  "https://isikef.rnu.tn/storage/menu/mAFspvXQALZjRMOmvXNGK6rUo0wy8E7S9L8txgNx.jpg",
  "https://isikef.rnu.tn/storage/menu/FeZsEBWTRFtTmLCYdnwGioaJKvanXXWanH5INrBw.jpg",
  "https://isikef.rnu.tn/storage/menu/ZYz1CYjOz9d2GR837DyZzfQcJU334iUsjw9VpfBP.jpg",
];

export const stats: Stat[] = [
  {
    label: "Approved resources",
    value: "248",
    trend: "+31 this month",
    icon: LibraryBig,
  },
  {
    label: "Questions solved",
    value: "1,420",
    trend: "82% with best answer",
    icon: CheckCircle2,
  },
  {
    label: "Searchable profiles",
    value: "312",
    trend: "skills, year, group",
    icon: Users,
  },
  {
    label: "Private contacts",
    value: "86",
    trend: "student-safe messages",
    icon: MessageCircle,
  },
];

export const resources: Resource[] = [
  {
    title: "Base de Donnees course pack",
    subject: "Databases",
    year: "2nd year",
    semester: "S1",
    type: "Course",
    uploader: "Aymen Louati",
    downloads: 203,
    rating: 4.9,
    status: "Approved",
    tags: ["SQL", "Course", "CS"],
  },
  {
    title: "Base de Donnees normalization summary",
    subject: "Databases",
    year: "2nd year",
    semester: "S1",
    type: "Summary",
    uploader: "Amen Jbali",
    downloads: 142,
    rating: 4.8,
    status: "Approved",
    tags: ["SQL", "MCD", "MLD"],
  },
  {
    title: "Java OOP course slides",
    subject: "Java",
    year: "1st year",
    semester: "S2",
    type: "Course",
    uploader: "Course team",
    downloads: 138,
    rating: 4.7,
    status: "Approved",
    tags: ["OOP", "Course", "CS", "CE"],
  },
  {
    title: "Java inheritance TP sheet",
    subject: "Java",
    year: "1st year",
    semester: "S2",
    type: "TP",
    uploader: "Rania K.",
    downloads: 74,
    rating: 4.4,
    status: "Approved",
    tags: ["OOP", "TP", "CS", "CE"],
  },
  {
    title: "Java OOP TD corrections pack",
    subject: "Java",
    year: "1st year",
    semester: "S2",
    type: "Correction",
    uploader: "Rania K.",
    downloads: 96,
    rating: 4.6,
    status: "Approved",
    tags: ["OOP", "TD", "Exam"],
  },
  {
    title: "Web Development course PDF",
    subject: "Web Development",
    year: "2nd year",
    semester: "S1",
    type: "Course",
    uploader: "Youssef M.",
    downloads: 119,
    rating: 4.5,
    status: "Approved",
    tags: ["PHP", "Course", "CS"],
  },
  {
    title: "PHP TP 3 starter code",
    subject: "Web Development",
    year: "2nd year",
    semester: "S1",
    type: "Code",
    uploader: "Youssef M.",
    downloads: 77,
    rating: 4.4,
    status: "Pending",
    tags: ["PHP", "MySQL", "TP"],
  },
  {
    title: "UML course and diagrams guide",
    subject: "Software Engineering",
    year: "2nd year",
    semester: "S2",
    type: "Course",
    uploader: "Nour H.",
    downloads: 146,
    rating: 4.8,
    status: "Approved",
    tags: ["UML", "Course", "CS"],
  },
  {
    title: "UML old exam practice sheet",
    subject: "Software Engineering",
    year: "2nd year",
    semester: "S2",
    type: "Old Exam",
    uploader: "Nour H.",
    downloads: 181,
    rating: 4.9,
    status: "Approved",
    tags: ["UML", "Revision"],
  },
  {
    title: "Computer networks course slides",
    subject: "Networks",
    year: "1st year",
    semester: "S2",
    type: "Course",
    uploader: "Mayssa B.",
    downloads: 155,
    rating: 4.8,
    status: "Approved",
    tags: ["RSI", "Course", "CE"],
  },
  {
    title: "Computer networks subnetting flashcards",
    subject: "Networks",
    year: "1st year",
    semester: "S2",
    type: "Revision",
    uploader: "Mayssa B.",
    downloads: 113,
    rating: 4.7,
    status: "Approved",
    tags: ["RSI", "IP", "Subnetting"],
  },
  {
    title: "Algorithms complexity revision sheet",
    subject: "Algorithms",
    year: "1st year",
    semester: "S1",
    type: "Revision",
    uploader: "Amen Jbali",
    downloads: 124,
    rating: 4.7,
    status: "Approved",
    tags: ["Algorithms", "CS", "CE"],
  },
  {
    title: "Linux administration course notes",
    subject: "Systems",
    year: "2nd year",
    semester: "S2",
    type: "Course",
    uploader: "Mayssa B.",
    downloads: 97,
    rating: 4.6,
    status: "Approved",
    tags: ["Linux", "Course", "CE"],
  },
  {
    title: "Linux administration TP corrections",
    subject: "Systems",
    year: "2nd year",
    semester: "S2",
    type: "Correction",
    uploader: "Mayssa B.",
    downloads: 88,
    rating: 4.5,
    status: "Approved",
    tags: ["Linux", "CE", "TP"],
  },
  {
    title: "Machine Learning course introduction",
    subject: "AI",
    year: "3rd year",
    semester: "S1",
    type: "Course",
    uploader: "Nour H.",
    downloads: 112,
    rating: 4.7,
    status: "Approved",
    tags: ["AI", "Python", "Course", "CS"],
  },
  {
    title: "Machine Learning revision roadmap",
    subject: "AI",
    year: "3rd year",
    semester: "S1",
    type: "Summary",
    uploader: "Nour H.",
    downloads: 103,
    rating: 4.6,
    status: "Approved",
    tags: ["AI", "Python", "CS"],
  },
  {
    title: "Cybersecurity course pack",
    subject: "Security",
    year: "3rd year",
    semester: "S2",
    type: "Course",
    uploader: "Youssef M.",
    downloads: 91,
    rating: 4.6,
    status: "Approved",
    tags: ["Security", "Course", "CE"],
  },
  {
    title: "Cybersecurity basics old exam",
    subject: "Security",
    year: "3rd year",
    semester: "S2",
    type: "Old Exam",
    uploader: "Youssef M.",
    downloads: 69,
    rating: 4.3,
    status: "Approved",
    tags: ["Security", "Networks", "CE"],
  },
  {
    title: "PFE report template and defense checklist",
    subject: "PFE",
    year: "3rd year",
    semester: "S2",
    type: "Summary",
    uploader: "Rania K.",
    downloads: 151,
    rating: 4.8,
    status: "Approved",
    tags: ["PFE", "Internship", "CS", "CE"],
  },
];

export const questions: Question[] = [
  {
    title: "What should I revise first for the database exam?",
    category: "Exam",
    tags: ["Database", "SQL", "2nd year"],
    answers: 8,
    votes: 32,
    anonymous: false,
    solved: true,
    excerpt:
      "I have old exams but I do not know how to prioritize normalization, relational algebra, and SQL queries.",
  },
  {
    title: "Is 2nd year harder than 1st year?",
    category: "Anonymous",
    tags: ["Advice", "Student life"],
    answers: 14,
    votes: 45,
    anonymous: true,
    solved: false,
    excerpt:
      "I am worried about the workload and I want honest advice without naming professors or students.",
  },
  {
    title: "Who can help me understand React hooks?",
    category: "Skill help",
    tags: ["React", "JavaScript", "Study buddy"],
    answers: 5,
    votes: 18,
    anonymous: false,
    solved: false,
    excerpt:
      "I want a short private study session before the web development TD next week.",
  },
  {
    title: "How do I debug PHP form validation in TP?",
    category: "TP",
    tags: ["PHP", "TP", "Web"],
    answers: 3,
    votes: 12,
    anonymous: false,
    solved: true,
    excerpt:
      "The form submits but errors are not displayed. I attached my route and validation logic.",
  },
];

export const courses: Course[] = [
  {
    name: "Base de Donnees",
    year: "2nd year",
    semester: "S1",
    professor: "Course team",
    department: "Sciences Informatiques et Web",
    focus: ["Normalization", "Relational algebra", "SQL", "MCD/MLD"],
    resources: 42,
    tips: [
      "Practice TD exercises before reading summaries.",
      "Build small schemas and write SQL by hand.",
      "Review common mistakes around keys and dependencies.",
    ],
  },
  {
    name: "Programmation Java",
    year: "1st year",
    semester: "S2",
    professor: "Course team",
    department: "Sciences Informatiques et Web",
    focus: ["OOP", "Collections", "Exceptions", "Files"],
    resources: 34,
    tips: [
      "Rewrite examples without looking at the correction.",
      "Explain inheritance and interfaces in your own words.",
      "Keep a notebook of frequent compiler errors.",
    ],
  },
  {
    name: "Reseaux Informatiques",
    year: "1st year",
    semester: "S2",
    professor: "Course team",
    department: "Technologie des Réseaux Informatiques",
    focus: ["Subnetting", "Routing", "TCP/IP", "Security basics"],
    resources: 28,
    tips: [
      "Train subnetting daily in short sessions.",
      "Draw packet journeys instead of memorizing only definitions.",
      "Keep command-line labs with screenshots and notes.",
    ],
  },
];

export const professors: Professor[] = [
  {
    name: "Respectful professor guide",
    subjects: ["All courses"],
    tone: "Advice is moderated and written as preparation notes, never personal attacks.",
    advice: [
      "Mention exam patterns only when confirmed by resources.",
      "Share office-hour or email details only when public.",
      "Report insulting or rumor-based comments.",
    ],
  },
  {
    name: "Aymen Louati",
    subjects: ["GLSI department contact"],
    tone: "Public department information from the ISI Kef site.",
    advice: [
      "Use the department page for official contact information.",
      "Keep student tips focused on course preparation.",
    ],
  },
  {
    name: "Mootassem Belleh Zoghlami",
    subjects: ["Computer Engineering department contact"],
    tone: "Public department information from the ISI Kef site.",
    advice: [
      "Use the department page for official contact information.",
      "Do not publish private schedules or personal details.",
    ],
  },
];

export const studentProfiles: StudentProfile[] = [
  {
    name: "Amen Jbali",
    year: "2nd year",
    group: "Group B",
    specialty: "GLSI",
    skills: ["Python", "Java", "PHP", "Databases"],
    interests: ["Web Development", "Data Science", "AI"],
    lookingFor: "Study partners and backend practice",
    bio: "Shares database notes and likes explaining TD corrections step by step.",
    points: 1260,
    status: "Online",
  },
  {
    name: "Rania Khelifi",
    year: "1st year",
    group: "Group A",
    specialty: "Computer Science",
    skills: ["Java", "Algorithms", "English"],
    interests: ["Competitive programming", "Public speaking"],
    lookingFor: "Java revision buddies",
    bio: "Good at turning confusing OOP examples into small exercises.",
    points: 820,
    status: "Studying",
  },
  {
    name: "Youssef Mansouri",
    year: "2nd year",
    group: "Group C",
    specialty: "GLSI",
    skills: ["React", "Spring Boot", "MySQL"],
    interests: ["UI", "APIs", "Freelance"],
    lookingFor: "Frontend pair sessions",
    bio: "Can help with React basics and clean component structure.",
    points: 1030,
    status: "Online",
  },
  {
    name: "Mayssa Ben Salem",
    year: "1st year",
    group: "Group D",
    specialty: "Computer Engineering",
    skills: ["Networks", "Linux", "Subnetting"],
    interests: ["Cybersecurity", "Cloud"],
    lookingFor: "Network lab practice",
    bio: "Keeps practical network flashcards and command notes.",
    points: 940,
    status: "Away",
  },
  {
    name: "Nour Hammami",
    year: "3rd year",
    group: "PFE",
    specialty: "GLSI",
    skills: ["UML", "Laravel", "GitHub"],
    interests: ["Internships", "Portfolio"],
    lookingFor: "CV and portfolio exchange",
    bio: "Helps students polish GitHub profiles and internship applications.",
    points: 1510,
    status: "Online",
  },
];

export const events: Event[] = [
  {
    title: "Intro to React Workshop",
    organizer: "CLUB MICROSOFT",
    date: "12 May, 14:00",
    location: "Room 3",
    participants: 38,
    type: "Workshop",
  },
  {
    title: "Database exam revision circle",
    organizer: "Student study group",
    date: "Sunday, 16:00",
    location: "Library",
    participants: 12,
    type: "Study session",
  },
  {
    title: "Cybersecurity mini CTF",
    organizer: "CyberSicca",
    date: "Friday, 10:00",
    location: "Lab 2",
    participants: 27,
    type: "Competition",
  },
];

export const clubs: Club[] = [
  { name: "CyberSicca", focus: "Cybersecurity", members: 64, accent: "teal" },
  { name: "IDER Club ISIK", focus: "Innovation and development", members: 51, accent: "blue" },
  { name: "AI Vision", focus: "Artificial intelligence", members: 47, accent: "violet" },
  { name: "Enactus Limitl' ESS ISI Kef", focus: "Social entrepreneurship", members: 42, accent: "amber" },
  { name: "ANT ISI Kef", focus: "Technology community", members: 39, accent: "green" },
  { name: "CHESS Ring ISIKEF", focus: "Chess and strategy", members: 25, accent: "slate" },
  { name: "CHILL'O", focus: "Student life", members: 30, accent: "rose" },
  { name: "CLUB MICROSOFT", focus: "IT workshops and group learning", members: 58, accent: "cyan" },
  { name: "Venisca", focus: "Music and campus culture", members: 34, accent: "orange" },
];

export const guideItems: GuideItem[] = [
  {
    title: "New Student Guide",
    description:
      "First week checklist, how to find rooms, how to join class groups, and how to ask for help.",
    icon: GraduationCap,
    bullets: [
      "Find your group and timetable before the first TD/TP week.",
      "Join verified class channels from students you know in person.",
      "Ask questions early; older students can explain campus habits without judging.",
    ],
  },
  {
    title: "Administration Guide",
    description:
      "Where to request documents, public contact details, and reminders to protect private information.",
    icon: Building2,
    bullets: [
      "Use official ISI Kef channels for certificates, inscriptions, and final decisions.",
      "Do not post student card photos or private document scans in public threads.",
      "Keep a copy of request dates and names of required documents.",
    ],
  },
  {
    title: "Exam Guide",
    description:
      "Revision strategy, old-exam workflow, respectful professor preparation notes, and group study planning.",
    icon: ClipboardCheck,
    bullets: [
      "Start with TD/TP corrections, then summaries, then old exams.",
      "Make a small mistake list for SQL, UML, Java, and network commands.",
      "Use professor notes as preparation advice, never as personal criticism.",
    ],
  },
  {
    title: "Transport and Housing",
    description:
      "Student tips for moving around Kef, housing questions, nearby services, and useful local places.",
    icon: Network,
    bullets: [
      "Share transport tips with date/context because schedules change.",
      "Marketplace and rent posts should use TND and clear photos.",
      "Do not publish someone else's phone number without permission.",
    ],
  },
];

export const feed: FeedItem[] = [
  {
    author: "Amen Jbali",
    role: "2nd year GLSI",
    body: "Uploaded a clean database normalization sheet and linked it to the Base de Donnees course page.",
    tag: "Resource",
    metric: "142 downloads",
  },
  {
    author: "Anonymous student",
    role: "Moderated question",
    body: "Asked how to recover after failing a subject. The thread now has supportive advice and admin-safe next steps.",
    tag: "Anonymous Q&A",
    metric: "14 answers",
  },
  {
    author: "Mayssa Ben Salem",
    role: "1st year Computer Engineering",
    body: "Opened a subnetting practice thread for anyone who wants a short private study session.",
    tag: "Student help",
    metric: "9 contacts",
  },
];

export const adminQueue: AdminItem[] = [
  {
    title: "Resources waiting for approval",
    count: 7,
    detail: "Check duplicates, subject tags, and file safety before publishing.",
    severity: "medium",
  },
  {
    title: "Anonymous questions to review",
    count: 4,
    detail: "Make sure no names, insults, rumors, or professor attacks are included.",
    severity: "high",
  },
  {
    title: "Reported marketplace listings",
    count: 2,
    detail: "Review suspicious pricing and contact behavior before restoring.",
    severity: "medium",
  },
  {
    title: "New club event requests",
    count: 5,
    detail: "Approve public event visibility and check organizer permissions.",
    severity: "low",
  },
];

export const badges = [
  { name: "Database Helper", icon: Brain },
  { name: "Resource Hero", icon: Trophy },
  { name: "Study Buddy", icon: Users },
  { name: "Java Beginner", icon: Code2 },
];

export const roadmap = [
  {
    version: "MVP",
    title: "Students, resources, Q&A, courses, professors, posts, ISI Bot",
    state: "Publish-ready web build",
  },
  {
    version: "V2",
    title: "Study groups, clubs, notifications, badges, lost and found",
    state: "Next build",
  },
  {
    version: "V3",
    title: "Real-time chat, skill exchange, marketplace, ISI Bot, mobile app",
    state: "Future",
  },
];
