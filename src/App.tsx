import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  Check,
  Download,
  Filter,
  Heart,
  ImagePlus,
  Languages,
  LockKeyhole,
  LogIn,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Repeat2,
  Search,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Upload,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import {
  badges,
  campusImages,
  clubs,
  courses,
  events,
  navItems,
  officialFacts,
  questions,
  resources,
  studentProfiles,
  type AccountType,
  type Resource,
  type ResourceStatus,
  type SectionId,
  type StudentProfile,
} from "./data";

type AuthMode = "signin" | "create";
type ActionKind = "ask" | "anonymous" | "upload" | "answer" | "event" | "profile" | "reports";
type CreateAccountType = "Student" | "Professor";
type PostModerationStatus = "Approved" | "Pending" | "Rejected";
type AccountRequestStatus = "Pending" | "Accepted" | "Rejected";
type AccountStatus = StudentProfile["status"];
type Language = "en" | "fr";
type FileProgram = "CS" | "CE";

const demoAdminPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD?.trim() ?? "";
const enableDemoAdmin = import.meta.env.VITE_ENABLE_DEMO_ADMIN === "true" && demoAdminPassword.length > 0;

interface FileRoom {
  program: FileProgram;
  year: string;
}

interface ResourceUploadPayload {
  program: FileProgram;
  year: string;
  subject: string;
  type: string;
  semester: string;
  title: string;
  fileName: string;
  tags: string[];
}

interface Account {
  name: string;
  email: string;
  accountType: AccountType;
  year?: string;
  department?: string;
  status?: AccountStatus;
  points?: number;
}

interface StoredAccount extends Account {
  password: string;
  verified: boolean;
  banned?: boolean;
  studentCard?: string;
  lockedAdmin?: boolean;
}

interface AccountRequest {
  id: string;
  name: string;
  email: string;
  password: string;
  accountType: CreateAccountType;
  year?: string;
  department?: string;
  studentCard?: string;
  status: AccountRequestStatus;
}

type AuthSubmitPayload =
  | { mode: "signin"; name: string; password: string }
  | {
      mode: "create";
      name: string;
      email: string;
      password: string;
      accountType: CreateAccountType;
      year?: string;
      department?: string;
      studentCard?: string;
    };

interface SearchResult {
  title: string;
  meta: string;
  section: SectionId;
}

interface ProfessorCourseMaterial {
  id: string;
  title: string;
  type: string;
  year: string;
  semester: string;
  description: string;
  uploadedAt: string;
}

interface ProfessorProfile {
  name: string;
  role: string;
  department: string;
  bio: string;
  courses: ProfessorCourseMaterial[];
}

interface StudentPost {
  id: string;
  author: string;
  body: string;
  time: string;
  tag: string;
  photo?: string;
  likes: number;
  reposts: number;
  shares: number;
  likedBy: string[];
  comments: PostComment[];
  moderationStatus: PostModerationStatus;
}

interface PostComment {
  id: string;
  author: string;
  body: string;
  time: string;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

interface BotMessage {
  id: string;
  sender: "bot" | "user";
  body: string;
}

interface PointLedgerEntry {
  id: string;
  name: string;
  amount: number;
  reason: string;
  time: string;
}

const uiCopy = {
  en: {
      searchPlaceholder: "Search TD, TP, student...",
    switchLanguage: "Switch language",
    join: "Join",
    signIn: "Sign in",
    createAccount: "Create account",
    disconnect: "Disconnect",
    account: "Account",
    mainNavigation: "Main navigation",
    closeMenu: "Close menu",
    community: "ISI Kef community",
    notifications: "Notifications",
    markRead: "Mark read",
    nav: {
      home: "Home",
      resources: "Files",
      questions: "Ask",
      posts: "Posts",
      courses: "Professors",
      connect: "Students",
      messages: "Chat",
      bot: "AI Bot",
      events: "Events",
      profile: "Profile",
      admin: "Admin",
    } satisfies Record<SectionId, string>,
    home: {
      greeting: "Asslema",
      guest: "student",
      title: "Stay connected in ISIK.",
      text: "Resources, questions, classmates and ISI Bot help, organized without noise.",
      officialLabel: "Official campus context",
      officialText: "ISI Kef is part of the University of Jendouba and presents itself around technology, knowledge, innovation and ISO 21001 quality.",
      officialLink: "Open official site",
      open: "Open",
      wannaJoin: "Wanna join us?",
      createReady: "Create an account when you are ready.",
      joinCta: "Join ISI Connect",
      seeCommunity: "See community",
      pills: ["TD/TP resources", "Exam week help", "GLSI and Computer Engineering", "Clubs around Kef"],
      features: [
        ["Files for TD, TP and exams", "Find summaries, corrections and old exams without searching through random group chats.", "resources"],
        ["Ask classmates", "Post a simple question, ask anonymously when needed, and keep answers respectful.", "questions"],
        ["Find someone who can help", "Search students by Java, PHP, SQL, React, networks, year or group and message them privately.", "connect"],
        ["Ask ISI Bot", "Get a quick tutorial, absence calculation, new student guide, revision plan or resource suggestion.", "bot"],
      ] as Array<[string, string, SectionId]>,
    },
    pages: {
      resources: ["Resource library", "Find TD, TP, corrections, summaries and old exams."],
      questions: ["Questions and answers", "Ask respectfully, answer clearly, and mark the best solution."],
      posts: ["Mini community", "Announcements, photos, comments and campus updates from ISIK students."],
      courses: ["Professor classrooms", "Professor profiles organized like simple classroom spaces."],
      connect: ["Students", "Search profiles and contact classmates privately."],
      messages: ["Private chat", "Your student messages here."],
      bot: ["ISI Bot room", "Your guide for ISI Connect, campus life, absences and revision."],
      events: ["Events and clubs", "Workshops, club events, revision sessions and campus life."],
      admin: ["Admin control", "Approve accounts, moderate posts and protect the community."],
    },
    buttons: {
      upload: "Upload",
      open: "Open",
      messageUploader: "Message uploader",
      anonymous: "Anonymous",
      ask: "Ask",
      answer: "Answer",
      publish: "Publish",
      comment: "Comment",
      like: "Like",
      repost: "Repost",
      share: "Share",
      findStudent: "Find student",
      send: "Send",
      createEvent: "Create event",
      join: "Join",
      editProfile: "Edit profile",
      accept: "Accept",
      reject: "Reject",
      makeModerator: "Make moderator",
      ban: "Ban",
      startTour: "Start tour",
      cancel: "Cancel",
      submit: "Submit",
    },
    misc: {
      by: "By",
      downloads: "downloads",
      votes: "votes",
      answers: "answers",
      bestAnswer: "Best answer",
      warning: "Anonymous questions are moderated. No insults, rumors, or personal attacks.",
      yourActivePosts: "your active posts",
      yourComments: "your comments",
      likesReceived: "likes received",
      communityPost: "Community post",
      shareWithStudents: "Share with ISIK students",
      postDescription: "Announcements, photos, revision plans, club notes, lost items and quick help requests.",
      postPlaceholder: "What do you want to share with ISIK?",
      campusPhoto: "Campus photo",
      loginRequired: "Login required",
      signInToPublish: "Sign in to publish posts.",
      signInToPublishText: "You can read the community feed, but posting announcements, photos and comments needs an account.",
      history: "History",
      studentsContacted: "Students contacted",
      privateContact: "Student-safe private contact",
      privateReportable: "Private, reportable student contact.",
      writePrivate: "Write a private message...",
      signInToMessage: "Sign in to send a message",
      status: "Account status",
      statusHelp: "Your status updates from your real session: online while active, studying in learning spaces, away after inactivity, and offline after disconnect.",
      reputation: "Reputation",
      pointsAndBadges: "Points and badges",
      recentPoints: "Recent point activity",
      noPointsYet: "Earn points by posting helpful answers, comments, resources and events.",
      points: "points",
      posts: "posts",
      comments: "comments",
      likes: "likes",
      quickPrompts: "Quick prompts",
      startFast: "Start fast",
      botHelp: "Ask anything a new or current ISIK student needs.",
      botText: "ISI Bot can explain the app, guide new students, calculate absence risk from your message, suggest resources, and help you find classmates.",
      classrooms: "Classrooms",
      chooseProfessor: "Choose a professor",
      professorNote: "Students enter a professor profile first. Materials then appear only for their year level.",
      classroomView: "Classroom view",
      openProfessorTitle: "Open a professor profile to see courses.",
      openProfessorText: "This keeps the page clean for students: professor first, then course stream, TD, TP, summaries and exam material.",
      classroom: "classroom",
      total: "total",
      visible: "visible",
      level: "level",
      all: "All",
      professorUpload: "Professor upload",
      addCourseMaterial: "Add course material",
      uploadHelp: "Your uploads are grouped under your classroom profile, like classwork in Google Classroom.",
      typeLabel: "Type",
      yearLabel: "Year",
      semesterLabel: "Semester",
      courseTitle: "Course title",
      courseTitlePlaceholder: "Example: Algorithmique S1 course PDF",
      materialDescriptionPlaceholder: "Short description, chapters, or instructions...",
      uploadToClassroom: "Upload to my classroom",
      ownClassroomWarning: "Uploads are available only inside your own professor classroom.",
      classwork: "Classwork",
      courseMaterials: "Course materials",
      materialsLabel: "materials",
      showing: "Showing",
      openMaterial: "Open material",
      chooseFileRoom: "Choose your file room",
      fileRoomText: "Start with your level and field. Search appears after you enter the right room.",
      computerScience: "Computer Science",
      softwareEngineering: "Software Engineering",
      computerScienceTrack: "Computer Science / Software Engineering",
      computerScienceText: "First-year common computer science resources before entering the software engineering path.",
      softwareEngineeringText: "Software engineering resources for 2nd and 3rd year students: web, databases, UML, AI and projects.",
      computerEngineering: "Computer Engineering",
      computerEngineeringText: "CE resources for networks, systems, security, Linux and shared core modules.",
      firstYear: "1st year",
      secondYear: "2nd year",
      thirdYear: "3rd year",
      openRoom: "Open room",
      filesCount: "files",
      backToYears: "Back to years",
      searchInRoom: "Search in this room...",
      noRoomFiles: "No files match this room yet.",
      selectedRoom: "Selected room",
      roomResources: "Room resources",
      commonCourses: "Common modules can appear in both CS and CE rooms.",
      chooseCourse: "Choose a course",
      chooseCourseText: "Each course has its own space. Open one to see course PDFs, summaries, TD, TP, corrections, exams and code.",
      openCourse: "Open course",
      backToCourses: "Back to courses",
      materialCategories: "Material categories",
      openType: "Open type",
      courseCount: "courses",
      noCourseFiles: "No course files match this search yet.",
      uploadResourceTitle: "Upload to the file system",
      uploadResourceText: "Choose the exact path, course and material type so students find it in the right room.",
      programLabel: "Path",
      fileLabel: "File",
      fileReady: "Ready",
      uploadFilePlaceholder: "Example: database-course.pdf",
      tagsPlaceholder: "Tags separated by commas: SQL, exam, TP",
      previewResource: "Resource preview",
      openPreview: "Open preview",
      noMaterialsLevel: "No materials for this level yet.",
      signInMaterial: "Sign in to see course material.",
      noVisiblePrefix: "This classroom has no visible material for",
      studentLevelOnly: "Student accounts see only the material matching their level.",
      about: "About",
      classroomHow: "How this classroom works",
      classroomHowText: "Professor uploads stay attached to the professor profile. Student accounts see materials filtered by year.",
    },
    auth: {
      createLabel: "Create account",
      signInLabel: "Sign in",
      createTitle: "Join ISI Connect",
      signInTitle: "Welcome back",
      fullName: "Full name",
      password: "Password",
      forgot: "Forgot password?",
      demoAdmin: "Private demo admin is enabled from .env.",
      demoStudent: "Demo student: Student Alpha / student123",
      email: "Email",
      accountType: "Account type",
      studentLevel: "Student level",
      studentCard: "Student card upload",
      studentCardRequired: "Required for student account approval.",
      department: "Department",
      professorNoCard: "Professors do not need student card verification.",
      already: "Already have an account? Sign in",
      needAccount: "Need an account? Create one",
    },
  },
  fr: {
    searchPlaceholder: "Chercher TD, TP, étudiant...",
    switchLanguage: "Changer la langue",
    join: "Rejoindre",
    signIn: "Connexion",
    createAccount: "Créer un compte",
    disconnect: "Déconnexion",
    account: "Compte",
    mainNavigation: "Navigation",
    closeMenu: "Fermer le menu",
    community: "Communauté ISI Kef",
    notifications: "Notifications",
    markRead: "Tout lire",
    nav: {
      home: "Accueil",
      resources: "Fichiers",
      questions: "Questions",
      posts: "Posts",
      courses: "Profs",
      connect: "Étudiants",
      messages: "Chat",
      bot: "AI Bot",
      events: "Événements",
      profile: "Profil",
      admin: "Admin",
    } satisfies Record<SectionId, string>,
    home: {
      greeting: "Asslema",
      guest: "étudiant",
      title: "Reste connecté à l'ISIK.",
      text: "Ressources, questions, camarades et aide ISI Bot, organisés sans bruit.",
      officialLabel: "Contexte officiel",
      officialText: "L'ISI Kef fait partie de l'Université de Jendouba et se présente autour de la technologie, du savoir, de l'innovation et de la qualité ISO 21001.",
      officialLink: "Ouvrir le site officiel",
      open: "Ouvrir",
      wannaJoin: "Tu veux nous rejoindre ?",
      createReady: "Crée un compte quand tu es prêt.",
      joinCta: "Rejoindre ISI Connect",
      seeCommunity: "Voir la communauté",
      pills: ["Ressources TD/TP", "Aide examens", "GLSI et génie informatique", "Clubs au Kef"],
      features: [
        ["Fichiers pour TD, TP et examens", "Trouve résumés, corrections et anciens examens sans fouiller partout.", "resources"],
        ["Demander aux camarades", "Pose une question simplement, anonymement si besoin, avec respect.", "questions"],
        ["Trouver quelqu'un qui aide", "Cherche par Java, PHP, SQL, React, réseaux, année ou groupe puis contacte en privé.", "connect"],
        ["Demander à ISI Bot", "Tutoriel, calcul d'absences, guide nouveau, planning de révision ou ressources.", "bot"],
      ] as Array<[string, string, SectionId]>,
    },
    pages: {
      resources: ["Bibliothèque de ressources", "Trouve TD, TP, corrections, résumés et anciens examens."],
      questions: ["Questions et réponses", "Demande avec respect, réponds clairement, marque la meilleure réponse."],
      posts: ["Mini communauté", "Annonces, photos, commentaires et actualités des étudiants ISIK."],
      courses: ["Espaces professeurs", "Profils professeurs organisés comme des classes simples."],
      connect: ["Étudiants", "Cherche les profils et contacte tes camarades en privé."],
      messages: ["Chat privé", "Tes messages étudiants ici."],
      bot: ["Salle ISI Bot", "Ton guide pour ISI Connect, la vie campus, les absences et la révision."],
      events: ["Événements et clubs", "Workshops, événements clubs, séances de révision et vie campus."],
      admin: ["Contrôle admin", "Accepter les comptes, modérer les posts et protéger la communauté."],
    },
    buttons: {
      upload: "Uploader",
      open: "Ouvrir",
      messageUploader: "Contacter l'uploader",
      anonymous: "Anonyme",
      ask: "Demander",
      answer: "Répondre",
      publish: "Publier",
      comment: "Commenter",
      like: "J'aime",
      repost: "Reposter",
      share: "Partager",
      findStudent: "Trouver étudiant",
      send: "Envoyer",
      createEvent: "Créer événement",
      join: "Participer",
      editProfile: "Modifier profil",
      accept: "Accepter",
      reject: "Refuser",
      makeModerator: "Rendre modérateur",
      ban: "Bannir",
      startTour: "Commencer le tour",
      cancel: "Annuler",
      submit: "Envoyer",
    },
    misc: {
      by: "Par",
      downloads: "téléchargements",
      votes: "votes",
      answers: "réponses",
      bestAnswer: "Meilleure réponse",
      warning: "Les questions anonymes sont modérées. Pas d'insultes, de rumeurs ou d'attaques personnelles.",
      yourActivePosts: "tes posts actifs",
      yourComments: "tes commentaires",
      likesReceived: "likes reçus",
      communityPost: "Post communauté",
      shareWithStudents: "Partager avec les étudiants ISIK",
      postDescription: "Annonces, photos, plans de révision, clubs, objets perdus et demandes d'aide.",
      postPlaceholder: "Que veux-tu partager avec l'ISIK ?",
      campusPhoto: "Photo campus",
      loginRequired: "Connexion requise",
      signInToPublish: "Connecte-toi pour publier.",
      signInToPublishText: "Tu peux lire le feed, mais publier et commenter nécessite un compte.",
      history: "Historique",
      studentsContacted: "Étudiants contactés",
      privateContact: "Contact privé sécurisé",
      privateReportable: "Contact étudiant privé et signalable.",
      writePrivate: "Écrire un message privé...",
      signInToMessage: "Connecte-toi pour envoyer un message",
      status: "Statut du compte",
      statusHelp: "Ton statut suit ta vraie session : en ligne quand tu es actif, en étude dans les espaces de travail, absent après inactivité, hors ligne après déconnexion.",
      reputation: "Réputation",
      pointsAndBadges: "Points et badges",
      recentPoints: "Activité récente",
      noPointsYet: "Gagne des points avec réponses, commentaires, ressources et événements utiles.",
      points: "points",
      posts: "posts",
      comments: "commentaires",
      likes: "likes",
      quickPrompts: "Prompts rapides",
      startFast: "Démarrer vite",
      botHelp: "Demande tout ce dont un étudiant ISIK a besoin.",
      botText: "ISI Bot explique l'app, guide les nouveaux, calcule le risque d'absences, suggère des ressources et aide à trouver des camarades.",
      classrooms: "Classes",
      chooseProfessor: "Choisir un professeur",
      professorNote: "Les étudiants entrent d'abord dans le profil du professeur. Les documents apparaissent ensuite selon leur niveau.",
      classroomView: "Vue classe",
      openProfessorTitle: "Ouvre un profil professeur pour voir les cours.",
      openProfessorText: "La page reste claire : professeur d'abord, puis flux de cours, TD, TP, résumés et documents d'examen.",
      classroom: "classe",
      total: "total",
      visible: "visible",
      level: "niveau",
      all: "Tous",
      professorUpload: "Upload professeur",
      addCourseMaterial: "Ajouter un support de cours",
      uploadHelp: "Tes uploads restent groupés dans ton espace professeur, comme les devoirs dans Google Classroom.",
      typeLabel: "Type",
      yearLabel: "Année",
      semesterLabel: "Semestre",
      courseTitle: "Titre du cours",
      courseTitlePlaceholder: "Exemple : Algorithmique S1 PDF",
      materialDescriptionPlaceholder: "Courte description, chapitres ou consignes...",
      uploadToClassroom: "Uploader dans ma classe",
      ownClassroomWarning: "Les uploads sont disponibles uniquement dans ton propre espace professeur.",
      classwork: "Travaux",
      courseMaterials: "Supports de cours",
      materialsLabel: "supports",
      showing: "Affichage",
      openMaterial: "Ouvrir support",
      chooseFileRoom: "Choisir ton espace fichiers",
      fileRoomText: "Commence par ton niveau et ta filière. La recherche apparaît après l'entrée dans le bon espace.",
      computerScience: "Sciences d'informatique",
      softwareEngineering: "Génie logiciel",
      computerScienceTrack: "Sciences d'informatique / Génie logiciel",
      computerScienceText: "Ressources communes de 1ère année en sciences d'informatique avant le parcours génie logiciel.",
      softwareEngineeringText: "Ressources génie logiciel pour 2ème et 3ème année : web, bases de données, UML, IA et projets.",
      computerEngineering: "Ingénierie des réseaux et systèmes informatiques",
      computerEngineeringText: "Ressources LIRI pour réseaux, systèmes, sécurité, Linux et modules communs.",
      firstYear: "1ère année",
      secondYear: "2ème année",
      thirdYear: "3ème année",
      openRoom: "Ouvrir l'espace",
      filesCount: "fichiers",
      backToYears: "Retour aux années",
      searchInRoom: "Chercher dans cet espace...",
      noRoomFiles: "Aucun fichier ne correspond encore à cet espace.",
      selectedRoom: "Espace sélectionné",
      roomResources: "Ressources de l'espace",
      commonCourses: "Les modules communs peuvent apparaître dans les espaces CS et CE.",
      chooseCourse: "Choisir un cours",
      chooseCourseText: "Chaque cours a son propre espace. Ouvre-le pour voir cours, résumés, TD, TP, corrections, examens et code.",
      openCourse: "Ouvrir le cours",
      backToCourses: "Retour aux cours",
      materialCategories: "Catégories de supports",
      openType: "Ouvrir le type",
      courseCount: "cours",
      noCourseFiles: "Aucun fichier de cours ne correspond à cette recherche.",
      uploadResourceTitle: "Uploader dans le système fichiers",
      uploadResourceText: "Choisis le parcours, le cours et le type de support pour que les étudiants le trouvent au bon endroit.",
      programLabel: "Parcours",
      fileLabel: "Fichier",
      fileReady: "Prêt",
      uploadFilePlaceholder: "Exemple : cours-base-donnees.pdf",
      tagsPlaceholder: "Tags séparés par virgules : SQL, examen, TP",
      previewResource: "Aperçu de la ressource",
      openPreview: "Ouvrir l'aperçu",
      noMaterialsLevel: "Aucun support pour ce niveau pour le moment.",
      signInMaterial: "Connecte-toi pour voir les supports.",
      noVisiblePrefix: "Cette classe n'a pas encore de support visible pour",
      studentLevelOnly: "Les comptes étudiants voient seulement les supports correspondant à leur niveau.",
      about: "À propos",
      classroomHow: "Fonctionnement de la classe",
      classroomHowText: "Les uploads restent attachés au profil professeur. Les comptes étudiants voient les supports filtrés par année.",
    },
    auth: {
      createLabel: "Créer compte",
      signInLabel: "Connexion",
      createTitle: "Rejoindre ISI Connect",
      signInTitle: "Bon retour",
      fullName: "Nom complet",
      password: "Mot de passe",
      forgot: "Mot de passe oublié ?",
      demoAdmin: "Le compte admin privé est activé via .env.",
      demoStudent: "Démo étudiant : Student Alpha / student123",
      email: "Email",
      accountType: "Type de compte",
      studentLevel: "Niveau étudiant",
      studentCard: "Carte étudiant",
      studentCardRequired: "Requise pour valider le compte étudiant.",
      department: "Département",
      professorNoCard: "Les professeurs n'ont pas besoin de carte étudiant.",
      already: "Déjà un compte ? Connexion",
      needAccount: "Besoin d'un compte ? Créer",
    },
  },
} as const;
type UICopy = (typeof uiCopy)[Language];

const featureCards = [
  {
    title: "Files for TD, TP and exams",
    text: "Find summaries, corrections and old exams without searching through random group chats.",
    section: "resources" as SectionId,
  },
  {
    title: "Ask classmates",
    text: "Post a simple question, ask anonymously when needed, and keep answers respectful.",
    section: "questions" as SectionId,
  },
  {
    title: "Find someone who can help",
    text: "Search students by Java, PHP, SQL, React, networks, year or group and message them privately.",
    section: "connect" as SectionId,
  },
  {
    title: "Ask ISI Bot",
    text: "Get a quick tutorial, absence calculation, new student guide, revision plan or resource suggestion.",
    section: "bot" as SectionId,
  },
];

const calmNavIds: SectionId[] = ["home", "resources", "questions", "posts", "courses", "connect", "messages", "bot"];

const navLabels: Partial<Record<SectionId, string>> = {
  resources: "Files",
  questions: "Ask",
  posts: "Posts",
  courses: "Professors",
  connect: "Students",
  messages: "Chat",
  bot: "AI Bot",
};

const campusPills = [
  "TD/TP resources",
  "Exam week help",
  "GLSI and Computer Engineering",
  "Clubs around Kef",
];

const resourceYears = ["All years", "1st year", "2nd year", "3rd year"];
const fileRoomYears = ["1st year", "2nd year", "3rd year"];
const filePrograms: FileProgram[] = ["CS", "CE"];
const resourceTypes = ["All types", "Course", "TD", "TP", "Summary", "Correction", "Old Exam", "Code", "Revision"];
const resourceStatuses: Array<ResourceStatus | "All"> = ["All", "Approved", "Pending", "Flagged"];
const accountTypes: CreateAccountType[] = ["Student", "Professor"];
const materialTypes = ["Course", "TD", "TP", "Correction", "Summary", "Old Exam"];
const postCategories = ["Announcement", "Question", "Photo", "Revision", "Club", "Lost & Found"];
const isiLogoUrl = "https://isikef.rnu.tn/pwa/apple-touch-icon-180x180.png";
const languageStorageKey = "isi-connect-language-v1";
const notificationStorageKey = "isi-connect-notifications-v1";
const pointsStorageKey = "isi-connect-points-v1";
const pointLedgerStorageKey = "isi-connect-point-ledger-v1";
const pointKeysStorageKey = "isi-connect-point-keys-v1";
const studyingSections = new Set<SectionId>(["resources", "questions", "courses", "bot"]);
const pointRules = {
  accountApproved: 10,
  profileCompleted: 20,
  resourceSubmitted: 8,
  questionAsked: 5,
  anonymousQuestion: 3,
  answerPosted: 5,
  privateMessage: 1,
  postApproved: 10,
  commentPosted: 3,
  likeReceived: 1,
  reposted: 2,
  shared: 1,
  eventJoined: 5,
  eventCreated: 10,
  reportReviewed: 5,
} as const;
const pointRuleCards = [
  { label: "Approved post", points: pointRules.postApproved },
  { label: "Answer a question", points: pointRules.answerPosted },
  { label: "Comment helpfully", points: pointRules.commentPosted },
  { label: "Join an event", points: pointRules.eventJoined },
  { label: "Upload resource", points: pointRules.resourceSubmitted },
  { label: "Profile completed", points: pointRules.profileCompleted },
];
const pointLevels = [
  { title: "New helper", min: 0 },
  { title: "Active student", min: 50 },
  { title: "Resource helper", min: 150 },
  { title: "Campus mentor", min: 400 },
  { title: "ISI legend", min: 1000 },
];
const botSuggestions = [
  "Find SQL resources",
  "Who can help me with React?",
  "Show me how to use ISI Connect",
  "Make a 3-day exam plan",
  "I have 3 absences out of 20 sessions",
  "What should I do before PHP TP?",
];

const tourSteps: Array<{ section: SectionId; title: string; text: string }> = [
  {
    section: "home",
    title: "Welcome to ISI Connect",
    text: "This is your calm campus start page: official ISI Kef context, quick shortcuts, and the main search bar.",
  },
  {
    section: "resources",
    title: "Find TD, TP and exam files",
    text: "Use Files to search summaries, corrections, code, old exams and resources by year, type or subject.",
  },
  {
    section: "questions",
    title: "Ask classmates",
    text: "Use Questions when one exercise, exam topic or campus problem needs a clear answer from students.",
  },
  {
    section: "courses",
    title: "Open professor classrooms",
    text: "Pick a professor profile to see course material. Student accounts only see material for their level.",
  },
  {
    section: "connect",
    title: "Find students by skill",
    text: "Search a name or skill like React, Java, SQL, Networks or PHP, then open a private chat.",
  },
  {
    section: "posts",
    title: "Use the community wall",
    text: "Share announcements, photos, revision updates and campus posts. Posts wait for moderation before going public.",
  },
  {
    section: "bot",
    title: "Ask ISI Bot anytime",
    text: "Ask for tutorials, absence calculations, revision plans, new student advice, resource suggestions or who can help.",
  },
];
const initialProfessorProfiles: ProfessorProfile[] = [
  {
    name: "Professor Alpha",
    role: "GLSI department contact",
    department: "Sciences Informatiques et Web",
    bio: "Professor profile for official course materials, chapter plans, TD/TP files, and revision notes.",
    courses: [
      {
        id: "prof-course-1",
        title: "Base de Donnees - Chapter plan",
        type: "Course",
        year: "2nd year",
        semester: "S1",
        description: "Normalization, relational algebra, SQL, MCD and MLD sequence.",
        uploadedAt: "Pinned",
      },
      {
        id: "prof-course-2",
        title: "Programmation Java - OOP TD set",
        type: "TD",
        year: "1st year",
        semester: "S2",
        description: "Exercises for classes, inheritance, interfaces and exceptions.",
        uploadedAt: "This semester",
      },
    ],
  },
  {
    name: "Professor Beta",
    role: "Computer Engineering department contact",
    department: "Technologie des Réseaux Informatiques",
    bio: "A dedicated profile where network and engineering course documents stay grouped by module.",
    courses: [
      {
        id: "prof-course-3",
        title: "Réseaux Informatiques - Subnetting guide",
        type: "Summary",
        year: "1st year",
        semester: "S2",
        description: "Short guide for IPv4 addressing, masks and routing basics.",
        uploadedAt: "This week",
      },
    ],
  },
  {
    name: "Course team",
    role: "Shared teaching team",
    department: "ISI Kef",
    bio: "Shared space for modules uploaded by a teaching team instead of a single professor.",
    courses: [
      {
        id: "prof-course-4",
        title: "Exam revision checklist",
        type: "Old Exam",
        year: "All years",
        semester: "Revision",
        description: "Organized checklist for chapters, TD corrections and common mistakes.",
        uploadedAt: "Updated",
      },
    ],
  },
];
const initialStudentPosts: StudentPost[] = [
  {
    id: "post-1",
    author: "Student Epsilon",
    body: "Anyone revising reseaux tomorrow in the library? I can help with subnetting.",
    time: "Today",
    tag: "Revision",
    photo: campusImages[1],
    likes: 24,
    reposts: 4,
    shares: 8,
    likedBy: [],
    comments: [
      { id: "comment-1", author: "Student Alpha", body: "I am in. Around 14:00?", time: "2h ago" },
      { id: "comment-2", author: "Student Delta", body: "Please send the room when you confirm.", time: "1h ago" },
    ],
    moderationStatus: "Approved",
  },
  {
    id: "post-2",
    author: "Student Gamma",
    body: "Small tip: for PHP TP, test your database connection before touching the interface.",
    time: "Yesterday",
    tag: "Announcement",
    likes: 41,
    reposts: 7,
    shares: 14,
    likedBy: ["Student Alpha"],
    comments: [
      { id: "comment-3", author: "Student Beta", body: "This saved my TP last week.", time: "Yesterday" },
    ],
    moderationStatus: "Approved",
  },
  {
    id: "post-3",
    author: "Student Delta",
    body: "Lost a black notebook near room 5. Please message me if you found it.",
    time: "This week",
    tag: "Lost & Found",
    photo: campusImages[2],
    likes: 12,
    reposts: 11,
    shares: 5,
    likedBy: [],
    comments: [],
    moderationStatus: "Pending",
  },
];

const demoAdminAccount: StoredAccount = {
  name: "ISI Admin",
  email: "admin@example.test",
  password: demoAdminPassword,
  accountType: "Admin",
  verified: true,
  lockedAdmin: true,
  status: "Offline",
  points: 0,
};

const demoAccounts: StoredAccount[] = [
  {
    name: "Student Alpha",
    email: "student.alpha@example.test",
    password: "student123",
    accountType: "Student",
    year: "2nd year",
    verified: true,
    studentCard: "student-alpha-card.jpg",
    status: "Offline",
    points: 1260,
  },
  {
    name: "Professor Alpha",
    email: "professor.alpha@example.test",
    password: "prof123",
    accountType: "Professor",
    department: "Sciences Informatiques et Web",
    verified: true,
    status: "Offline",
    points: 0,
  },
];

const initialAccounts: StoredAccount[] = [
  ...(enableDemoAdmin ? [demoAdminAccount] : []),
  ...demoAccounts,
];

const initialAccountRequests: AccountRequest[] = [
  {
    id: "request-1",
    name: "Student Beta",
    email: "student.beta@example.test",
    password: "student123",
    accountType: "Student",
    year: "1st year",
    studentCard: "student-beta-card.png",
    status: "Pending",
  },
  {
    id: "request-2",
    name: "Student Gamma",
    email: "student.gamma@example.test",
    password: "student123",
    accountType: "Student",
    year: "2nd year",
    studentCard: "student-gamma-card.jpg",
    status: "Pending",
  },
];
const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Community feed is live",
    body: "Students can now post announcements, photos and comments.",
    time: "Now",
    unread: true,
  },
  {
    id: "notif-2",
    title: "Revision activity",
    body: "A reseaux revision post is trending in the community.",
    time: "Today",
    unread: true,
  },
];

function loadStoredNotifications() {
  try {
    const stored = window.localStorage.getItem(notificationStorageKey);
    if (!stored) {
      return initialNotifications;
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return initialNotifications;
    }

    return parsed
      .filter((item): item is NotificationItem =>
        typeof item?.id === "string"
        && typeof item.title === "string"
        && typeof item.body === "string"
        && typeof item.time === "string"
        && typeof item.unread === "boolean",
      )
      .slice(0, 10);
  } catch {
    return initialNotifications;
  }
}

function loadStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(languageStorageKey);
    return stored === "fr" || stored === "en" ? stored : "en";
  } catch {
    return "en";
  }
}

const welcomeToastByLanguage: Record<Language, string> = {
  en: "Asslema. ISI Connect is a friendly space for ISI Kef students.",
  fr: "Asslema. ISI Connect est un espace simple pour les étudiants de l'ISI Kef.",
};

const botWelcomeByLanguage: Record<Language, string> = {
  en: "Asslema. I am ISI Bot. I can explain how to use the app, guide new students, calculate absence risk, find resources, suggest revision plans, and help you contact classmates.",
  fr: "Asslema. Je suis ISI Bot. Je peux expliquer l'app, guider les nouveaux étudiants, calculer le risque d'absence, trouver des ressources, proposer un planning de révision et aider à contacter des camarades.",
};

function createInitialPointBalances() {
  const balances: Record<string, number> = {};
  studentProfiles.forEach((profile) => {
    balances[profile.name] = profile.points;
  });
  initialAccounts.forEach((account) => {
    balances[account.name] = account.points ?? balances[account.name] ?? 0;
  });

  return balances;
}

function loadStoredPointBalances() {
  const base = createInitialPointBalances();
  try {
    const stored = window.localStorage.getItem(pointsStorageKey);
    if (!stored) {
      return base;
    }

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return base;
    }

    Object.entries(parsed).forEach(([name, value]) => {
      if (typeof value === "number" && Number.isFinite(value)) {
        base[name] = Math.max(0, Math.round(value));
      }
    });

    return base;
  } catch {
    return base;
  }
}

function loadStoredPointLedger() {
  try {
    const stored = window.localStorage.getItem(pointLedgerStorageKey);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is PointLedgerEntry =>
        typeof item?.id === "string"
        && typeof item.name === "string"
        && typeof item.amount === "number"
        && typeof item.reason === "string"
        && typeof item.time === "string",
      )
      .slice(0, 80);
  } catch {
    return [];
  }
}

function loadStoredPointKeys() {
  try {
    const stored = window.localStorage.getItem(pointKeysStorageKey);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 240) : [];
  } catch {
    return [];
  }
}

function automaticStatusForSection(section: SectionId): AccountStatus {
  return studyingSections.has(section) ? "Studying" : "Online";
}

function resourceMatchesFileRoom(resource: Resource, room: FileRoom) {
  const matchesYear = resource.year === room.year || resource.year === "All years";
  if (!matchesYear) {
    return false;
  }

  const haystack = `${resource.title} ${resource.subject} ${resource.tags.join(" ")}`.toLowerCase();
  const lowerTags = resource.tags.map((tag) => tag.toLowerCase());
  const isCommon = ["java", "oop", "algorithm", "pfe", "internship", "math"].some((term) => haystack.includes(term))
    || (lowerTags.includes("cs") && (lowerTags.includes("ce") || lowerTags.includes("ci")));
  const isCE = ["network", "reseaux", "réseaux", "rsi", "subnet", "ip", "linux", "system", "security", "cyber"].some((term) => haystack.includes(term))
    || lowerTags.includes("ce")
    || lowerTags.includes("ci");

  if (room.program === "CE") {
    return isCE || isCommon;
  }

  return !isCE || isCommon || lowerTags.includes("cs");
}

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>(loadStoredLanguage);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [currentUser, setCurrentUser] = useState<Account | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [approvedAccounts, setApprovedAccounts] = useState<StoredAccount[]>(initialAccounts);
  const [accountStatuses, setAccountStatuses] = useState<Record<string, AccountStatus>>(() => ({
    ...Object.fromEntries(studentProfiles.map((profile) => [profile.name, profile.status] as const)),
    ...Object.fromEntries(initialAccounts.map((account) => [account.name, account.status ?? "Offline"] as const)),
  }));
  const [accountRequests, setAccountRequests] = useState<AccountRequest[]>(initialAccountRequests);
  const [resourceItems, setResourceItems] = useState<Resource[]>(resources);
  const [toast, setToast] = useState(() => welcomeToastByLanguage[loadStoredLanguage()]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(loadStoredNotifications);
  const [pointBalances, setPointBalances] = useState<Record<string, number>>(loadStoredPointBalances);
  const [pointLedger, setPointLedger] = useState<PointLedgerEntry[]>(loadStoredPointLedger);
  const [pointKeys, setPointKeys] = useState<string[]>(loadStoredPointKeys);
  const [action, setAction] = useState<ActionKind | null>(null);
  const [resourceUploadOpen, setResourceUploadOpen] = useState(false);
  const [selectedResourcePreview, setSelectedResourcePreview] = useState<Resource | null>(null);
  const [globalQuery, setGlobalQuery] = useState("");
  const [resourceQuery, setResourceQuery] = useState("");
  const [year, setYear] = useState("All years");
  const [type, setType] = useState("All types");
  const [status, setStatus] = useState<ResourceStatus | "All">("All");
  const [selectedFileRoom, setSelectedFileRoom] = useState<FileRoom | null>(null);
  const [selectedFileCourse, setSelectedFileCourse] = useState<string | null>(null);
  const [selectedFileMaterialType, setSelectedFileMaterialType] = useState<string | null>(null);
  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile>(studentProfiles[0]);
  const [message, setMessage] = useState("");
  const [botDraft, setBotDraft] = useState("");
  const [botMessages, setBotMessages] = useState<BotMessage[]>(() => [
    {
      id: "bot-welcome",
      sender: "bot",
      body: botWelcomeByLanguage[loadStoredLanguage()],
    },
  ]);
  const [sentMessages, setSentMessages] = useState<Record<string, string[]>>({
    "Student Alpha": ["Asslema Student Alpha, can you send me the BD normalization summary?"],
    "Student Epsilon": ["Can we revise subnetting before TP?"],
  });
  const [studentPosts, setStudentPosts] = useState<StudentPost[]>(initialStudentPosts);
  const [postDraft, setPostDraft] = useState("");
  const [postCategory, setPostCategory] = useState("Announcement");
  const [postPhoto, setPostPhoto] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [professorProfiles, setProfessorProfiles] = useState<ProfessorProfile[]>(initialProfessorProfiles);
  const [selectedProfessorName, setSelectedProfessorName] = useState<string | null>(null);
  const [professorUpload, setProfessorUpload] = useState({
    title: "",
    type: "Course",
    year: "2nd year",
    semester: "S1",
    description: "",
  });

  const canSeeResourceModeration = currentUser?.accountType === "Admin"
    || currentUser?.accountType === "Moderator"
    || currentUser?.accountType === "Professor";
  const filteredResources = useMemo(() => {
    const term = resourceQuery.trim().toLowerCase();
    return resourceItems.filter((resource) => {
      const matchQuery = !term || searchable(resource).includes(term);
      const matchRoom = selectedFileRoom ? resourceMatchesFileRoom(resource, selectedFileRoom) : true;
      const matchYear = selectedFileRoom ? true : year === "All years" || resource.year === year;
      const matchType = type === "All types" || resource.type === type;
      const matchStatus = canSeeResourceModeration ? status === "All" || resource.status === status : resource.status === "Approved";
      return matchRoom && matchQuery && matchYear && matchType && matchStatus;
    });
  }, [canSeeResourceModeration, resourceItems, resourceQuery, selectedFileRoom, year, type, status]);
  const fileCourses = useMemo(() => {
    const grouped = new Map<string, Resource[]>();
    filteredResources.forEach((resource) => {
      grouped.set(resource.subject, [...(grouped.get(resource.subject) ?? []), resource]);
    });

    return Array.from(grouped.entries())
      .map(([subject, courseResources]) => ({
        subject,
        count: courseResources.length,
        types: Array.from(new Set(courseResources.map((resource) => resource.type))),
        downloads: courseResources.reduce((total, resource) => total + resource.downloads, 0),
      }))
      .sort((a, b) => a.subject.localeCompare(b.subject));
  }, [filteredResources]);
  const selectedCourseResources = selectedFileCourse
    ? filteredResources.filter((resource) => resource.subject === selectedFileCourse)
    : [];
  const displayedCourseResources = selectedFileMaterialType
    ? selectedCourseResources.filter((resource) => resource.type === selectedFileMaterialType)
    : selectedCourseResources;
  const selectedCourseMaterialGroups = useMemo(() => {
    const grouped = new Map<string, Resource[]>();
    selectedCourseResources.forEach((resource) => {
      grouped.set(resource.type, [...(grouped.get(resource.type) ?? []), resource]);
    });

    return Array.from(grouped.entries()).map(([materialType, materialResources]) => ({
      type: materialType,
      resources: materialResources,
      downloads: materialResources.reduce((total, resource) => total + resource.downloads, 0),
    }));
  }, [selectedCourseResources]);

  const filteredStudents = useMemo(() => {
    const term = studentQuery.trim().toLowerCase();
    if (!term) {
      return studentProfiles;
    }

    return studentProfiles.filter((profile) =>
      profile.name.toLowerCase().includes(term)
      || profile.skills.some((skill) => skill.toLowerCase().includes(term)),
    );
  }, [studentQuery]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const term = globalQuery.trim().toLowerCase();
    if (!term) {
      return [];
    }

    return [
      ...resourceItems
        .filter((resource) => searchable(resource).includes(term))
        .map((resource) => ({ title: resource.title, meta: `${resource.subject} resource`, section: "resources" as const })),
      ...questions
        .filter((question) => searchable(question).includes(term))
        .map((question) => ({ title: question.title, meta: `${question.answers} answers`, section: "questions" as const })),
      ...studentPosts
        .filter((post) => searchable(post).includes(term))
        .map((post) => ({ title: post.body, meta: `Post by ${post.author}`, section: "posts" as const })),
      ...professorProfiles
        .filter((profile) => searchable(profile).includes(term))
        .map((profile) => ({ title: profile.name, meta: `${profile.courses.length} professor uploads`, section: "courses" as const })),
      ...studentProfiles
        .filter((profile) => searchable(profile).includes(term))
        .map((profile) => ({ title: profile.name, meta: `${profile.year} - ${profile.skills.slice(0, 2).join(", ")}`, section: "connect" as const })),
      ...courses
        .filter((course) => searchable(course).includes(term))
        .map((course) => ({ title: course.name, meta: `${course.year} course`, section: "courses" as const })),
    ].slice(0, 7);
  }, [globalQuery, professorProfiles, resourceItems, studentPosts]);

  const visibleNavItems = navItems.filter((item) => {
    if (item.id === "admin") {
      return currentUser?.accountType === "Admin" || currentUser?.accountType === "Moderator";
    }

    return calmNavIds.includes(item.id);
  });

  const canModerate = currentUser?.accountType === "Admin" || currentUser?.accountType === "Moderator";
  const isAdmin = currentUser?.accountType === "Admin";
  const activeTourStep = tourStep === null ? null : tourSteps[tourStep] ?? null;
  const visibleStudentPosts = studentPosts.filter((post) => post.moderationStatus === "Approved" || canModerate || post.author === currentUser?.name);
  const pendingStudentPosts = studentPosts.filter((post) => post.moderationStatus === "Pending");
  const pendingAccountRequests = accountRequests.filter((request) => request.status === "Pending");
  const managedAccounts = approvedAccounts.filter((account) => !account.lockedAdmin);

  const chatHistory = useMemo(() => {
    const contactedNames = new Set(Object.keys(sentMessages));
    contactedNames.add(selectedStudent.name);

    return studentProfiles.filter((profile) => contactedNames.has(profile.name));
  }, [selectedStudent.name, sentMessages]);

  const selectedProfessor = useMemo(() => {
    if (!selectedProfessorName) {
      return null;
    }

    return professorProfiles.find((profile) => profile.name === selectedProfessorName) ?? null;
  }, [professorProfiles, selectedProfessorName]);

  const studentLevel = currentUser?.accountType === "Student" ? currentUser.year ?? "2nd year" : null;
  const visibleProfessorCourses = useMemo(() => {
    if (!selectedProfessor) {
      return [];
    }

    if (!currentUser) {
      return [];
    }

    if (currentUser.accountType === "Student") {
      const level = currentUser.year ?? "2nd year";
      return selectedProfessor.courses.filter((course) => course.year === level || course.year === "All years");
    }

    return selectedProfessor.courses;
  }, [currentUser, selectedProfessor]);
  const canUploadProfessorCourse = currentUser?.accountType === "Professor" && selectedProfessor?.name === currentUser.name;

  const unreadNotifications = notifications.filter((notification) => notification.unread).length;
  const accountPostCount = currentUser ? studentPosts.filter((post) => post.author === currentUser.name).length : 0;
  const accountCommentCount = currentUser
    ? studentPosts.reduce((total, post) => total + post.comments.filter((comment) => comment.author === currentUser.name).length, 0)
    : 0;
  const accountLikesReceived = currentUser
    ? studentPosts.reduce((total, post) => total + (post.author === currentUser.name ? post.likes : 0), 0)
    : 0;
  const currentAccountStatus = currentUser ? getAccountStatus(currentUser.name, currentUser.status ?? "Online") : "Offline";
  const selectedStudentStatus = getStudentStatus(selectedStudent);
  const selectedStudentPoints = getPointBalance(selectedStudent.name);
  const currentPoints = currentUser ? getPointBalance(currentUser.name) : 0;
  const currentPointLevel = getPointLevel(currentPoints);
  const pointProgress = getPointProgress(currentPoints);
  const currentPointLedger = currentUser ? pointLedger.filter((entry) => entry.name === currentUser.name).slice(0, 5) : [];
  const copy = uiCopy[language];
  const nextLanguage = language === "en" ? "FR" : "EN";
  const materialTypeLabel = (value: string) => {
    if (language === "en") {
      return value;
    }

    const labels: Record<string, string> = {
      Course: "Cours",
      TD: "TD",
      TP: "TP",
      Correction: "Correction",
      Summary: "Résumé",
      "Old Exam": "Ancien examen",
      Code: "Code",
      Revision: "Révision",
    };

    return labels[value] ?? value;
  };
  const timingLabel = (value: string) => {
    if (language === "en") {
      return value;
    }

    const labels: Record<string, string> = {
      Pinned: "Épinglé",
      "This semester": "Ce semestre",
      "This week": "Cette semaine",
      Updated: "Mis à jour",
      "Just now": "À l'instant",
    };

    return labels[value] ?? value;
  };
  const professorRoleLabel = (value: string) => {
    if (language === "en") {
      return value;
    }

    const labels: Record<string, string> = {
      "GLSI department contact": "Contact département GLSI",
      "Computer Engineering department contact": "Contact génie informatique",
      "Shared teaching team": "Équipe pédagogique",
    };

    return labels[value] ?? value;
  };
  const professorDisplayName = (value: string) => (language === "fr" && value === "Course team" ? "Équipe cours" : value);
  const professorBioLabel = (value: string) => {
    if (language === "en") {
      return value;
    }

    const labels: Record<string, string> = {
      "Professor profile for official course materials, chapter plans, TD/TP files, and revision notes.": "Profil professeur pour les supports officiels, plans de chapitres, TD/TP et notes de révision.",
      "A dedicated profile where network and engineering course documents stay grouped by module.": "Un espace dédié où les documents réseaux et génie informatique restent groupés par module.",
      "Shared space for modules uploaded by a teaching team instead of a single professor.": "Espace partagé pour les modules ajoutés par une équipe pédagogique.",
    };

    return labels[value] ?? value;
  };
  const courseTitleLabel = (value: string) => {
    if (language === "en") {
      return value;
    }

    const labels: Record<string, string> = {
      "Base de Donnees - Chapter plan": "Base de Données - Plan du chapitre",
      "Programmation Java - OOP TD set": "Programmation Java - Série TD POO",
      "Réseaux Informatiques - Subnetting guide": "Réseaux Informatiques - Guide de sous-réseaux",
      "Exam revision checklist": "Checklist de révision examen",
    };

    return labels[value] ?? value;
  };
  const courseDescriptionLabel = (value: string) => {
    if (language === "en") {
      return value;
    }

    const labels: Record<string, string> = {
      "Normalization, relational algebra, SQL, MCD and MLD sequence.": "Normalisation, algèbre relationnelle, SQL, MCD et MLD.",
      "Exercises for classes, inheritance, interfaces and exceptions.": "Exercices sur les classes, l'héritage, les interfaces et les exceptions.",
      "Short guide for IPv4 addressing, masks and routing basics.": "Guide court pour l'adressage IPv4, les masques et les bases du routage.",
      "Organized checklist for chapters, TD corrections and common mistakes.": "Checklist organisée pour les chapitres, corrections TD et erreurs fréquentes.",
    };

    return labels[value] ?? value;
  };
  const fileProgramLabel = (program: FileProgram) => program === "CS" ? copy.misc.computerScienceTrack : copy.misc.computerEngineering;
  const fileRoomProgramLabel = (room: FileRoom) => {
    if (room.program === "CE") {
      return language === "fr" ? "LIRI" : copy.misc.computerEngineering;
    }

    return room.year === "1st year" ? copy.misc.computerScience : copy.misc.softwareEngineering;
  };
  const fileRoomDescription = (room: FileRoom) => {
    if (room.program === "CE") {
      return copy.misc.computerEngineeringText;
    }

    return room.year === "1st year" ? copy.misc.computerScienceText : copy.misc.softwareEngineeringText;
  };
  const fileProgramDescription = (program: FileProgram) => program === "CS"
    ? `${copy.misc.computerScienceText} ${copy.misc.softwareEngineeringText}`
    : copy.misc.computerEngineeringText;
  const fileYearLabel = (value: string) => {
    const labels: Record<string, string> = {
      "1st year": copy.misc.firstYear,
      "2nd year": copy.misc.secondYear,
      "3rd year": copy.misc.thirdYear,
    };

    return labels[value] ?? value;
  };
  const fileRoomTitle = (room: FileRoom) => `${fileRoomProgramLabel(room)} - ${fileYearLabel(room.year)}`;
  const openFileRoom = (room: FileRoom) => {
    setSelectedFileRoom(room);
    setSelectedFileCourse(null);
    setSelectedFileMaterialType(null);
    setResourceQuery("");
    setType("All types");
    setStatus("All");
    setYear(room.year);
  };
  const closeFileRoom = () => {
    setSelectedFileRoom(null);
    setSelectedFileCourse(null);
    setSelectedFileMaterialType(null);
    setResourceQuery("");
    setType("All types");
    setStatus("All");
  };
  const countRoomResources = (room: FileRoom) => resourceItems.filter((resource) =>
    resourceMatchesFileRoom(resource, room)
    && (canSeeResourceModeration || resource.status === "Approved"),
  ).length;
  const openFileCourse = (subject: string) => {
    setSelectedFileCourse(subject);
    setSelectedFileMaterialType(null);
  };
  const backToFileCourses = () => {
    setSelectedFileCourse(null);
    setSelectedFileMaterialType(null);
  };
  const updateResourceType = (nextType: string) => {
    setType(nextType);
    setSelectedFileMaterialType(null);
  };
  const uploadCourseOptions = useMemo(() => {
    const pool = selectedFileRoom
      ? resourceItems.filter((resource) => resourceMatchesFileRoom(resource, selectedFileRoom))
      : resourceItems;

    return Array.from(new Set(pool.map((resource) => resource.subject))).sort((a, b) => a.localeCompare(b));
  }, [resourceItems, selectedFileRoom]);

  useEffect(() => {
    try {
      window.localStorage.setItem(notificationStorageKey, JSON.stringify(notifications));
    } catch {
      // Persistence is helpful, but the prototype should still work without storage.
    }
  }, [notifications]);

  useEffect(() => {
    try {
      window.localStorage.setItem(languageStorageKey, language);
    } catch {
      // Language selection still works for the session without storage.
    }
  }, [language]);

  useEffect(() => {
    setToast((current) =>
      current === welcomeToastByLanguage.en || current === welcomeToastByLanguage.fr
        ? welcomeToastByLanguage[language]
        : current,
    );
    setBotMessages((messages) =>
      messages.length === 1
      && messages[0].id === "bot-welcome"
      && (messages[0].body === botWelcomeByLanguage.en || messages[0].body === botWelcomeByLanguage.fr)
        ? [{ ...messages[0], body: botWelcomeByLanguage[language] }]
        : messages,
    );
  }, [language]);

  useEffect(() => {
    try {
      window.localStorage.setItem(pointsStorageKey, JSON.stringify(pointBalances));
    } catch {
      // Point persistence is local-only in this prototype.
    }
  }, [pointBalances]);

  useEffect(() => {
    try {
      window.localStorage.setItem(pointLedgerStorageKey, JSON.stringify(pointLedger));
    } catch {
      // Ignore storage failures for point history.
    }
  }, [pointLedger]);

  useEffect(() => {
    try {
      window.localStorage.setItem(pointKeysStorageKey, JSON.stringify(pointKeys));
    } catch {
      // Ignore storage failures for one-time point guards.
    }
  }, [pointKeys]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let idleTimer = window.setTimeout(() => updateAccountStatus(currentUser.name, "Away"), 120000);
    const setPresentStatus = () => {
      window.clearTimeout(idleTimer);
      updateAccountStatus(currentUser.name, automaticStatusForSection(activeSection));
      idleTimer = window.setTimeout(() => updateAccountStatus(currentUser.name, "Away"), 120000);
    };
    const activityEvents = ["pointermove", "keydown", "click", "scroll", "touchstart"];

    setPresentStatus();
    activityEvents.forEach((eventName) => window.addEventListener(eventName, setPresentStatus, { passive: true }));

    return () => {
      window.clearTimeout(idleTimer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, setPresentStatus));
    };
  }, [activeSection, currentUser?.name]);

  function goTo(section: SectionId) {
    setActiveSection(section);
    setMenuOpen(false);
    setGlobalQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  function requireAccount(kind: ActionKind) {
    if (!currentUser && ["ask", "anonymous", "upload", "answer", "event"].includes(kind)) {
      setToast("Sign in first to use private student areas.");
      openAuth("signin");
      return;
    }

    setAction(kind);
  }

  function openResourceUpload() {
    if (!currentUser) {
      setToast("Sign in first to upload resources.");
      openAuth("signin");
      return;
    }

    setResourceUploadOpen(true);
  }

  function handleResourceUpload(payload: ResourceUploadPayload) {
    if (!currentUser) {
      openAuth("signin");
      return;
    }

    const statusForUpload: ResourceStatus = currentUser.accountType === "Student" ? "Pending" : "Approved";
    const normalizedTags = Array.from(new Set([
      ...payload.tags.map((tag) => tag.trim()).filter(Boolean),
      payload.program,
      payload.type,
    ]));
    const uploadedResource: Resource = {
      title: payload.title,
      subject: payload.subject,
      year: payload.year,
      semester: payload.semester,
      type: payload.type,
      uploader: currentUser.name,
      downloads: 0,
      rating: 0,
      status: statusForUpload,
      tags: normalizedTags,
    };

    setResourceItems((items) => [uploadedResource, ...items]);
    setSelectedFileRoom({ program: payload.program, year: payload.year });
    setSelectedFileCourse(payload.subject);
    setSelectedFileMaterialType(payload.type);
    setResourceQuery("");
    setType("All types");
    setStatus("All");
    setResourceUploadOpen(false);
    const awarded = awardCurrentUser(pointRules.resourceSubmitted, "Resource submitted");
    const visibleText = statusForUpload === "Pending" ? "Resource submitted for approval." : "Resource uploaded.";
    setToast(rewardMessage(visibleText, pointRules.resourceSubmitted, awarded));
    pushNotification("Resource uploaded", `${currentUser.name} added ${payload.title} to ${payload.subject}.`);
  }

  function pushNotification(title: string, body: string, unread = true) {
    setNotifications((items) => [
      {
        id: `notif-${Date.now()}`,
        title,
        body,
        time: "Just now",
        unread,
      },
      ...items,
    ].slice(0, 10));
  }

  function markNotificationsRead() {
    setNotifications((items) => {
      if (!items.some((item) => item.unread)) {
        return items;
      }

      return items.map((item) => ({ ...item, unread: false }));
    });
  }

  function toggleNotifications() {
    if (!notificationsOpen) {
      markNotificationsRead();
    }

    setNotificationsOpen((value) => !value);
  }

  function getAccountStatus(name: string, fallback: AccountStatus = "Offline") {
    return accountStatuses[name] ?? fallback;
  }

  function getStudentStatus(profile: StudentProfile) {
    return getAccountStatus(profile.name, profile.status);
  }

  function statusClass(value: AccountStatus) {
    return value.toLowerCase();
  }

  function getPointBalance(name: string) {
    return pointBalances[name] ?? studentProfiles.find((profile) => profile.name === name)?.points ?? approvedAccounts.find((account) => account.name === name)?.points ?? 0;
  }

  function getPointLevel(points: number) {
    return pointLevels.reduce((current, level) => points >= level.min ? level : current, pointLevels[0]);
  }

  function getPointProgress(points: number) {
    const currentLevelIndex = pointLevels.findIndex((level) => level.title === getPointLevel(points).title);
    const currentLevel = pointLevels[currentLevelIndex] ?? pointLevels[0];
    const nextLevel = pointLevels[currentLevelIndex + 1];
    if (!nextLevel) {
      return 100;
    }

    return Math.min(100, Math.round(((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100));
  }

  function clearPointKey(key: string) {
    setPointKeys((keys) => keys.filter((item) => item !== key));
  }

  function awardPoints(name: string, amount: number, reason: string, onceKey?: string) {
    if (!name || amount === 0) {
      return false;
    }
    if (onceKey && pointKeys.includes(onceKey)) {
      return false;
    }

    const cleanAmount = Math.round(amount);
    if (onceKey) {
      setPointKeys((keys) => keys.includes(onceKey) ? keys : [onceKey, ...keys].slice(0, 240));
    }
    setPointBalances((balances) => ({
      ...balances,
      [name]: Math.max(0, (balances[name] ?? getPointBalance(name)) + cleanAmount),
    }));
    setApprovedAccounts((accounts) =>
      accounts.map((account) =>
        account.name === name
          ? { ...account, points: Math.max(0, (account.points ?? getPointBalance(name)) + cleanAmount) }
          : account,
      ),
    );
    setCurrentUser((user) =>
      user?.name === name
        ? { ...user, points: Math.max(0, (user.points ?? getPointBalance(name)) + cleanAmount) }
        : user,
    );
    setPointLedger((entries) => [
      {
        id: `points-${Date.now()}-${Math.abs(cleanAmount)}-${entries.length}`,
        name,
        amount: cleanAmount,
        reason,
        time: "Just now",
      },
      ...entries,
    ].slice(0, 80));
    return true;
  }

  function awardCurrentUser(amount: number, reason: string, onceKey?: string) {
    if (!currentUser) {
      return false;
    }

    return awardPoints(currentUser.name, amount, reason, onceKey);
  }

  function rewardMessage(reason: string, amount: number, awarded: boolean) {
    return awarded ? `${reason} +${amount} points.` : reason;
  }

  function updateAccountStatus(name: string, nextStatus: AccountStatus) {
    setAccountStatuses((statuses) => statuses[name] === nextStatus ? statuses : { ...statuses, [name]: nextStatus });
    setApprovedAccounts((accounts) => {
      let changed = false;
      const nextAccounts = accounts.map((account) => {
        if (account.name !== name || account.status === nextStatus) {
          return account;
        }

        changed = true;
        return { ...account, status: nextStatus };
      });

      return changed ? nextAccounts : accounts;
    });
    setCurrentUser((user) => {
      if (user?.name !== name || user.status === nextStatus) {
        return user;
      }

      return { ...user, status: nextStatus };
    });
  }

  function maybeOpenTutorial(account: StoredAccount) {
    if (account.accountType === "Admin" || account.accountType === "Moderator") {
      return;
    }

    try {
      if (window.localStorage.getItem("isi-connect-tutorial-seen") === "yes") {
        return;
      }
    } catch {
      // If storage is unavailable, still show the tutorial for this session.
    }

    setTutorialOpen(true);
  }

  function markTutorialSeen() {
    try {
      window.localStorage.setItem("isi-connect-tutorial-seen", "yes");
    } catch {
      // Ignore storage failures in the prototype.
    }
  }

  function dismissTutorial() {
    setTutorialOpen(false);
    markTutorialSeen();
  }

  function startGuidedTour() {
    setTutorialOpen(false);
    setTourStep(0);
    markTutorialSeen();
    goTo(tourSteps[0].section);
    setToast("ISI Bot tour started. You can cancel it anytime.");
  }

  function cancelGuidedTour() {
    setTourStep(null);
    markTutorialSeen();
    setToast("Tour cancelled. ISI Bot is still available whenever you need help.");
  }

  function finishGuidedTour() {
    setTourStep(null);
    markTutorialSeen();
    setToast("Tour finished. Ask ISI Bot anytime for help.");
    sendBotMessage("Show me how to use ISI Connect");
  }

  function moveTour(direction: 1 | -1) {
    if (tourStep === null) {
      return;
    }

    const nextStep = tourStep + direction;
    if (nextStep < 0) {
      return;
    }
    if (nextStep >= tourSteps.length) {
      finishGuidedTour();
      return;
    }

    setTourStep(nextStep);
    goTo(tourSteps[nextStep].section);
  }

  function requireSignedCommunityAction() {
    if (currentUser) {
      return true;
    }

    setToast("Sign in first to interact with the community.");
    openAuth("signin");
    return false;
  }

  function sendPrivateMessage() {
    const clean = message.trim();
    if (!clean) {
      return;
    }
    if (!currentUser) {
      openAuth("signin");
      return;
    }
    setSentMessages((messages) => ({
      ...messages,
      [selectedStudent.name]: [...(messages[selectedStudent.name] ?? []), clean],
    }));
    setMessage("");
    const awarded = awardCurrentUser(pointRules.privateMessage, "Private contact started", `message:${currentUser.name}:${selectedStudent.name}`);
    setToast(rewardMessage(`Private message sent to ${selectedStudent.name}.`, pointRules.privateMessage, awarded));
    pushNotification("Message sent", `You contacted ${selectedStudent.name}.`);
  }

  function sendBotMessage(text = botDraft) {
    const clean = text.trim();
    if (!clean) {
      return;
    }

    const answer = buildBotAnswer(clean, currentUser);
    setBotMessages((messages) => [
      ...messages,
      { id: `bot-user-${Date.now()}`, sender: "user", body: clean },
      { id: `bot-answer-${Date.now()}`, sender: "bot", body: answer },
    ]);
    setBotDraft("");
    pushNotification("ISI Bot answered", "A new answer is ready in the AI room.");
  }

  function publishStudentPost() {
    const clean = postDraft.trim();
    if (!clean) {
      return;
    }
    if (!currentUser) {
      setToast("Sign in first to post on the student wall.");
      openAuth("signin");
      return;
    }

    setStudentPosts((posts) => [
      {
        id: `post-${Date.now()}`,
        author: currentUser.name,
        body: clean,
        time: "Just now",
        tag: postCategory,
        photo: postPhoto.trim() || undefined,
        likes: 0,
        reposts: 0,
        shares: 0,
        likedBy: [],
        comments: [],
        moderationStatus: "Pending",
      },
      ...posts,
    ]);
    setPostDraft("");
    setPostPhoto("");
    setToast("Post sent to moderation. It appears after admin approval.");
    pushNotification("Post waiting for approval", `${currentUser.name} posted a ${postCategory.toLowerCase()}.`);
  }

  function likePost(postId: string) {
    if (!requireSignedCommunityAction()) {
      return;
    }

    const post = studentPosts.find((item) => item.id === postId);
    if (!post) {
      return;
    }
    const userName = currentUser?.name ?? "";
    const liked = !post.likedBy.includes(userName);
    setStudentPosts((posts) =>
      posts.map((item) =>
        item.id === postId
          ? {
              ...item,
              likedBy: liked ? [...item.likedBy, userName] : item.likedBy.filter((name) => name !== userName),
              likes: Math.max(0, item.likes + (liked ? 1 : -1)),
            }
          : item,
      ),
    );
    const likeKey = `like:${postId}:${userName}`;
    const canRewardAuthor = post.author !== userName;
    if (liked && canRewardAuthor) {
      awardPoints(post.author, pointRules.likeReceived, "Like received", likeKey);
    }
    if (!liked && canRewardAuthor && pointKeys.includes(likeKey)) {
      clearPointKey(likeKey);
      awardPoints(post.author, -pointRules.likeReceived, "Like removed");
    }
    setToast(liked ? "Post liked." : "Like removed.");
    if (liked) {
      pushNotification("Post liked", `${currentUser?.name} liked ${post.author}'s post.`);
    }
  }

  function repostPost(postId: string) {
    if (!requireSignedCommunityAction()) {
      return;
    }

    const post = studentPosts.find((item) => item.id === postId);
    setStudentPosts((posts) => posts.map((item) => item.id === postId ? { ...item, reposts: item.reposts + 1 } : item));
    const awarded = awardCurrentUser(pointRules.reposted, "Helpful repost", `repost:${postId}:${currentUser?.name}`);
    setToast(rewardMessage("Post reposted to your community feed.", pointRules.reposted, awarded));
    pushNotification("Post reposted", `${currentUser?.name} reposted ${post?.author ?? "a student's"} post.`);
  }

  function sharePost(postId: string) {
    if (!requireSignedCommunityAction()) {
      return;
    }

    const post = studentPosts.find((item) => item.id === postId);
    setStudentPosts((posts) => posts.map((item) => item.id === postId ? { ...item, shares: item.shares + 1 } : item));
    const awarded = awardCurrentUser(pointRules.shared, "Resourceful share", `share:${postId}:${currentUser?.name}`);
    setToast(rewardMessage("Share link prepared.", pointRules.shared, awarded));
    pushNotification("Post shared", `${currentUser?.name} shared ${post?.author ?? "a student's"} post.`);
  }

  function addPostComment(postId: string) {
    if (!requireSignedCommunityAction()) {
      return;
    }

    const clean = (commentDrafts[postId] ?? "").trim();
    if (!clean) {
      return;
    }

    const post = studentPosts.find((item) => item.id === postId);
    setStudentPosts((posts) =>
      posts.map((item) =>
        item.id === postId
          ? {
              ...item,
              comments: [
                ...item.comments,
                {
                  id: `comment-${Date.now()}`,
                  author: currentUser?.name ?? "Student",
                  body: clean,
                  time: "Just now",
                },
              ],
            }
          : item,
      ),
    );
    setCommentDrafts((drafts) => ({ ...drafts, [postId]: "" }));
    const awarded = awardCurrentUser(pointRules.commentPosted, "Comment posted");
    setToast(rewardMessage("Comment added.", pointRules.commentPosted, awarded));
    pushNotification("New comment", `${currentUser?.name} commented on ${post?.author ?? "a student's"} post.`);
  }

  function accountExists(name: string, email?: string) {
    const cleanName = name.trim().toLowerCase();
    const cleanEmail = email?.trim().toLowerCase();
    return approvedAccounts.some((account) =>
      account.name.toLowerCase() === cleanName || (!!cleanEmail && account.email.toLowerCase() === cleanEmail),
    ) || accountRequests.some((request) =>
      request.status === "Pending"
      && (request.name.toLowerCase() === cleanName || (!!cleanEmail && request.email.toLowerCase() === cleanEmail)),
    );
  }

  function signInStoredAccount(account: StoredAccount) {
    const signInStatus: AccountStatus = "Online";
    const cleanAccount: Account = {
      name: account.name,
      email: account.email,
      accountType: account.accountType,
      year: account.year,
      department: account.department,
      status: signInStatus,
      points: getPointBalance(account.name),
    };
    setCurrentUser(cleanAccount);
    setAccountStatuses((statuses) => ({ ...statuses, [account.name]: signInStatus }));
    setApprovedAccounts((accounts) =>
      accounts.map((item) => item.name === account.name ? { ...item, status: signInStatus } : item),
    );
    setAuthOpen(false);

    if (account.accountType === "Professor") {
      setProfessorProfiles((profiles) => {
        const alreadyExists = profiles.some((profile) => profile.name === cleanAccount.name);
        if (alreadyExists) {
          return profiles;
        }

        return [createProfessorProfile(cleanAccount), ...profiles];
      });
      setSelectedProfessorName(cleanAccount.name);
      setActiveSection("courses");
      setToast(`${cleanAccount.name}'s professor classroom is ready.`);
      pushNotification("Professor classroom ready", `${cleanAccount.name}'s classroom was created automatically.`, false);
      maybeOpenTutorial(account);
      return;
    }

    if (account.accountType === "Student") {
      setSelectedProfessorName(null);
      setToast(`${cleanAccount.name} signed in as ${cleanAccount.year ?? "2nd year"} student.`);
      pushNotification("Welcome back", `${cleanAccount.name} joined the student community.`, false);
      maybeOpenTutorial(account);
      return;
    }

    setToast(`${cleanAccount.name} signed in as ${cleanAccount.accountType}.`);
    pushNotification("Account active", `${cleanAccount.name} signed in as ${cleanAccount.accountType}.`, false);
    maybeOpenTutorial(account);
  }

  function handleAuthSubmit(payload: AuthSubmitPayload) {
    if (payload.mode === "signin") {
      const account = approvedAccounts.find((item) => item.name.toLowerCase() === payload.name.trim().toLowerCase());
      if (!account || account.password !== payload.password) {
        const pending = accountRequests.find((request) => request.status === "Pending" && request.name.toLowerCase() === payload.name.trim().toLowerCase());
        if (pending) {
          setToast("Your account is still waiting for admin approval.");
          return false;
        }
        setToast("Full name or password is incorrect.");
        return false;
      }
      if (account.banned) {
        setToast("This account is banned. Contact administration.");
        return false;
      }
      if (!account.verified) {
        setToast("Your account is still waiting for admin approval.");
        return false;
      }
      signInStoredAccount(account);
      return true;
    }

    if (accountExists(payload.name, payload.email)) {
      setToast("This student or professor already has one account or a pending request.");
      return false;
    }

    if (payload.accountType === "Student" && !payload.studentCard) {
      setToast("Student card upload is required for student account approval.");
      return false;
    }

    if (payload.accountType === "Professor") {
      const professorAccount: StoredAccount = {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        accountType: "Professor",
      department: payload.department,
      verified: true,
      status: "Online",
      points: 0,
    };
      setApprovedAccounts((accounts) => [professorAccount, ...accounts]);
      signInStoredAccount(professorAccount);
      return true;
    }

    const request: AccountRequest = {
      id: `request-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      accountType: "Student",
      year: payload.year,
      studentCard: payload.studentCard,
      status: "Pending",
    };
    setAccountRequests((requests) => [request, ...requests]);
    setAuthOpen(false);
    setToast("Student account request sent. Admin or moderator must approve it first.");
    pushNotification("Account request pending", `${payload.name} uploaded a student card for review.`);
    return true;
  }

  function disconnectAccount() {
    const name = currentUser?.name ?? "student";
    if (currentUser) {
      updateAccountStatus(currentUser.name, "Offline");
    }
    setCurrentUser(null);
    setMenuOpen(false);
    setNotificationsOpen(false);
    setActiveSection("home");
    setAction(null);
    setToast(`${name} disconnected safely.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function uploadProfessorCourse() {
    if (!currentUser || currentUser.accountType !== "Professor") {
      setToast("Only professor accounts can add course material.");
      openAuth("signin");
      return;
    }

    const cleanTitle = professorUpload.title.trim();
    if (!cleanTitle) {
      setToast("Add a course title before uploading.");
      return;
    }

    const newMaterial: ProfessorCourseMaterial = {
      id: `prof-course-${Date.now()}`,
      title: cleanTitle,
      type: professorUpload.type,
      year: professorUpload.year,
      semester: professorUpload.semester,
      description: professorUpload.description.trim() || "Professor-uploaded course material.",
      uploadedAt: "Just now",
    };

    setProfessorProfiles((profiles) =>
      profiles.some((profile) => profile.name === currentUser.name)
        ? profiles.map((profile) =>
          profile.name === currentUser.name
          ? {
              ...profile,
              courses: [newMaterial, ...profile.courses],
            }
          : profile,
        )
        : [{ ...createProfessorProfile(currentUser), courses: [newMaterial] }, ...profiles],
    );
    setSelectedProfessorName(currentUser.name);
    setProfessorUpload((upload) => ({ ...upload, title: "", description: "" }));
    setToast(`Course uploaded to ${currentUser.name}'s classroom.`);
    pushNotification("Course material uploaded", `${currentUser.name} added ${cleanTitle}.`);
  }

  function joinEvent(eventTitle: string) {
    if (!currentUser) {
      setToast("Sign in first to join events.");
      openAuth("signin");
      return;
    }

    const awarded = awardCurrentUser(pointRules.eventJoined, "Joined campus event", `event:${eventTitle}:${currentUser.name}`);
    setToast(rewardMessage(`Joined ${eventTitle}.`, pointRules.eventJoined, awarded));
    pushNotification("Event joined", `${currentUser.name} joined ${eventTitle}.`);
  }

  function approveAccountRequest(requestId: string) {
    if (!canModerate) {
      return;
    }
    const request = accountRequests.find((item) => item.id === requestId);
    if (!request) {
      return;
    }
    const newAccount: StoredAccount = {
      name: request.name,
      email: request.email,
      password: request.password,
      accountType: request.accountType,
      year: request.year,
      department: request.department,
      verified: true,
      studentCard: request.studentCard,
      status: "Offline",
      points: getPointBalance(request.name),
    };
    setApprovedAccounts((accounts) => [newAccount, ...accounts]);
    setAccountRequests((requests) => requests.map((item) => item.id === requestId ? { ...item, status: "Accepted" } : item));
    const awarded = awardPoints(request.name, pointRules.accountApproved, "Account approved", `account-approved:${requestId}`);
    setToast(rewardMessage(`${request.name}'s account was accepted.`, pointRules.accountApproved, awarded));
    pushNotification("Account accepted", `${request.name} can now sign in.`);
  }

  function rejectAccountRequest(requestId: string) {
    if (!canModerate) {
      return;
    }
    const request = accountRequests.find((item) => item.id === requestId);
    setAccountRequests((requests) => requests.map((item) => item.id === requestId ? { ...item, status: "Rejected" } : item));
    setToast(`${request?.name ?? "Account"} request rejected.`);
  }

  function moderatePost(postId: string, status: PostModerationStatus) {
    if (!canModerate) {
      return;
    }
    const post = studentPosts.find((item) => item.id === postId);
    setStudentPosts((posts) => posts.map((item) => item.id === postId ? { ...item, moderationStatus: status } : item));
    const awarded = status === "Approved" && post
      ? awardPoints(post.author, pointRules.postApproved, "Community post approved", `post-approved:${postId}`)
      : false;
    setToast(rewardMessage(`${post?.author ?? "Post"} ${status.toLowerCase()}.`, pointRules.postApproved, awarded));
  }

  function banAccount(name: string) {
    if (!isAdmin) {
      setToast("Only the admin can ban accounts.");
      return;
    }
    setApprovedAccounts((accounts) => accounts.map((account) => account.name === name ? { ...account, banned: true } : account));
    if (currentUser?.name === name) {
      setCurrentUser(null);
      setActiveSection("home");
    }
    setToast(`${name} was banned.`);
  }

  function promoteModerator(name: string) {
    if (!isAdmin) {
      setToast("Only the admin can upgrade moderators.");
      return;
    }
    setApprovedAccounts((accounts) => accounts.map((account) => account.name === name ? { ...account, accountType: "Moderator" } : account));
    setToast(`${name} is now a moderator.`);
  }

  function handleActionSubmit(kind: ActionKind) {
    const copy = actionCopy[kind];
    const rewardByAction: Partial<Record<ActionKind, { points: number; reason: string; onceKey?: string }>> = {
      ask: { points: pointRules.questionAsked, reason: "Question asked" },
      anonymous: { points: pointRules.anonymousQuestion, reason: "Anonymous question sent" },
      upload: { points: pointRules.resourceSubmitted, reason: "Resource submitted" },
      answer: { points: pointRules.answerPosted, reason: "Answer posted" },
      event: { points: pointRules.eventCreated, reason: "Event request created" },
      profile: { points: pointRules.profileCompleted, reason: "Profile completed", onceKey: currentUser ? `profile:${currentUser.name}` : undefined },
      reports: { points: pointRules.reportReviewed, reason: "Report reviewed" },
    };
    const reward = rewardByAction[kind];
    const awarded = currentUser && reward
      ? awardCurrentUser(reward.points, reward.reason, reward.onceKey)
      : false;

    setToast(reward ? rewardMessage(copy.success, reward.points, awarded) : copy.success);
    setAction(null);
  }

  return (
    <div className={`app ${darkMode ? "dark" : ""}`} onClick={() => {
      if (notificationsOpen) {
        setNotificationsOpen(false);
      }
    }}>
      <style>{appStyles}</style>
      <div className="noise" />
      <div className="light-beam beam-one" />
      <div className="light-beam beam-two" />

      <nav className="navbar">
        <button className="menu-button" type="button" aria-label={copy.mainNavigation} onClick={() => setMenuOpen((value) => !value)}>
          <Menu />
        </button>

        <div className="global-search">
          <Search />
          <input
            aria-label="Search ISI Connect"
            value={globalQuery}
            placeholder={copy.searchPlaceholder}
            onChange={(event) => setGlobalQuery(event.target.value)}
          />
          {searchResults.length > 0 ? (
            <div className="search-results">
              {searchResults.map((result) => (
                <button key={`${result.section}-${result.title}`} type="button" onClick={() => goTo(result.section)}>
                  <strong>{result.title}</strong>
                  <span>{result.meta}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <button className="btn btn-soft" type="button" onClick={() => goTo("profile")}>
              {currentUser.accountType}
            </button>
          ) : (
            <button className="btn btn-primary" type="button" onClick={() => openAuth("create")}>
              <UserPlus />
              {copy.join}
            </button>
          )}
          <button className="language-toggle" type="button" aria-label={copy.switchLanguage} onClick={() => setLanguage((value) => value === "en" ? "fr" : "en")}>
            <Languages />
            <span>{nextLanguage}</span>
          </button>
          <button className="icon-button theme-toggle" type="button" aria-label="Toggle theme" onClick={() => setDarkMode((value) => !value)}>
            {darkMode ? <Sun /> : <Moon />}
          </button>
          <button className="icon-button notify-button" type="button" aria-label="Notifications" onClick={(event) => {
            event.stopPropagation();
            toggleNotifications();
          }}>
            <Bell />
            {unreadNotifications > 0 ? <span className="notification-badge">{unreadNotifications}</span> : null}
          </button>
          {notificationsOpen ? (
            <div className="notification-panel" onClick={(event) => event.stopPropagation()}>
              <div className="notification-head">
                <strong>{copy.notifications}</strong>
                <button type="button" onClick={markNotificationsRead}>{copy.markRead}</button>
              </div>
              <div className="notification-list" onScroll={markNotificationsRead}>
                {notifications.map((notification) => (
                  <article className={notification.unread ? "notification-item unread" : "notification-item"} key={notification.id}>
                    <span />
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.body}</p>
                      <small>{notification.time}</small>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </nav>

      <aside className={`side-menu ${menuOpen ? "open" : ""}`} aria-label={copy.mainNavigation}>
        <div className="side-menu-header">
          <span className="brand-mark logo-mark"><img src={isiLogoUrl} alt="ISI Kef logo" /></span>
          <div>
            <strong>ISI Connect</strong>
            <small>{copy.community}</small>
          </div>
          <button className="side-close" type="button" aria-label={copy.closeMenu} onClick={() => setMenuOpen(false)}><X /></button>
        </div>

        <div className="side-menu-body">
          <span className="menu-label">{copy.mainNavigation}</span>
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              className={activeSection === item.id ? "menu-item active" : "menu-item"}
              type="button"
              onClick={() => goTo(item.id)}
            >
              <item.icon />
              <span>{copy.nav[item.id]}</span>
            </button>
          ))}
        </div>

        <div className="side-menu-footer">
          <span className="menu-label">{copy.account}</span>
          {currentUser ? (
            <>
              <button className="menu-account" type="button" onClick={() => goTo("profile")}>
                <span className="avatar">{initials(currentUser.name)}</span>
                <span>
                  <strong>{currentUser.name}</strong>
                  <small>{currentUser.accountType} - {getPointBalance(currentUser.name)} pts</small>
                </span>
              </button>
              <button className="menu-disconnect" type="button" onClick={disconnectAccount}>
                <LogOut />
                {copy.disconnect}
              </button>
            </>
          ) : (
            <div className="menu-auth">
              <button type="button" onClick={() => {
                setMenuOpen(false);
                openAuth("signin");
              }}>{copy.signIn}</button>
              <button type="button" onClick={() => {
                setMenuOpen(false);
                openAuth("create");
              }}>{copy.createAccount}</button>
            </div>
          )}
        </div>
      </aside>
      {menuOpen ? <button className="menu-backdrop" type="button" aria-label={copy.closeMenu} onClick={() => setMenuOpen(false)} /> : null}

      <main className="container">
        <div className="toast">
          <span className="toast-mark"><Sparkles size={15} /></span>
          <span>{toast}</span>
        </div>

        {activeSection === "home" ? (
          <HomeSection
            goTo={goTo}
            openAuth={openAuth}
            currentUser={currentUser}
            copy={copy}
            language={language}
          />
        ) : null}

        {activeSection === "resources" ? (
          <PageShell
            label={copy.pages.resources[0]}
            title={copy.pages.resources[1]}
            action={
              <button className="btn btn-primary" type="button" onClick={openResourceUpload}>
                <Upload />
                {copy.buttons.upload}
              </button>
            }
          >
            {!selectedFileRoom ? (
              <section className="file-room-picker">
                <div className="section-title compact-title">
                  <span className="section-label">{copy.misc.chooseFileRoom}</span>
                  <h2>{copy.misc.fileRoomText}</h2>
                </div>
                <div className="file-program-grid">
                  {filePrograms.map((program) => (
                    <article className="file-program-panel" key={program}>
                      <div className="card-row">
                        <div>
                          <span className="section-label small">{program}</span>
                          <h3>{fileProgramLabel(program)}</h3>
                        </div>
                        <span className="status approved">{copy.misc.roomResources}</span>
                      </div>
                      <p>{fileProgramDescription(program)}</p>
                      <div className="file-year-grid">
                        {fileRoomYears.map((fileYear) => {
                          const room = { program, year: fileYear };
                          const fileCount = countRoomResources(room);

                          return (
                            <button className="file-room-card" key={`${program}-${fileYear}`} type="button" onClick={() => openFileRoom(room)}>
                              <span className="file-room-kicker">{program}</span>
                              <strong>{fileRoomProgramLabel(room)}</strong>
                              <span>{fileCount} {copy.misc.filesCount}</span>
                              <small>{fileYearLabel(fileYear)}</small>
                              <em>{copy.misc.openRoom}</em>
                            </button>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
                <p className="resource-helper">{copy.misc.commonCourses}</p>
              </section>
            ) : (
              <section className="resource-room">
                <article className="resource-room-head">
                  <button className="btn btn-soft" type="button" onClick={closeFileRoom}>
                    {copy.misc.backToYears}
                  </button>
                  <div>
                    <span className="section-label small">{copy.misc.selectedRoom}</span>
                    <h2>{fileRoomTitle(selectedFileRoom)}</h2>
                    <p>{fileRoomDescription(selectedFileRoom)}</p>
                  </div>
                  <span className="status approved">
                    {selectedFileCourse ? selectedCourseResources.length : fileCourses.length} {selectedFileCourse ? copy.misc.filesCount : copy.misc.courseCount}
                  </span>
                </article>
                <div className="filter-bar room-filter-bar">
                  <label className="search-field wide">
                    <Search />
                    <input value={resourceQuery} onChange={(event) => setResourceQuery(event.target.value)} placeholder={copy.misc.searchInRoom} />
                  </label>
                  <SelectBox icon={Filter} value={type} options={resourceTypes} onChange={updateResourceType} />
                  {canSeeResourceModeration ? (
                    <SelectBox icon={ShieldCheck} value={status} options={resourceStatuses} onChange={(value) => setStatus(value as ResourceStatus | "All")} />
                  ) : null}
                </div>
                {filteredResources.length === 0 ? (
                  <article className="resource-empty">
                    <BookOpen />
                    <h3>{copy.misc.noRoomFiles}</h3>
                    <p>{copy.misc.commonCourses}</p>
                  </article>
                ) : !selectedFileCourse ? (
                  <section className="course-browser">
                    <div className="section-title compact-title">
                      <span className="section-label">{copy.misc.chooseCourse}</span>
                      <h2>{copy.misc.chooseCourseText}</h2>
                    </div>
                    <div className="course-card-grid">
                      {fileCourses.map((course) => (
                        <button className="course-card" key={course.subject} type="button" onClick={() => openFileCourse(course.subject)}>
                          <span className="section-label small">{copy.misc.chooseCourse}</span>
                          <strong>{course.subject}</strong>
                          <p>{course.types.map(materialTypeLabel).join(" - ")}</p>
                          <span>{course.count} {copy.misc.filesCount}</span>
                          <small><Download /> {course.downloads}</small>
                          <em>{copy.misc.openCourse}</em>
                        </button>
                      ))}
                    </div>
                  </section>
                ) : (
                  <section className="course-browser">
                    <article className="course-browser-head">
                      <button className="btn btn-soft" type="button" onClick={backToFileCourses}>{copy.misc.backToCourses}</button>
                      <div>
                        <span className="section-label small">{copy.misc.chooseCourse}</span>
                        <h2>{selectedFileCourse}</h2>
                        <p>{copy.misc.materialCategories}</p>
                      </div>
                    </article>

                    {selectedCourseMaterialGroups.length > 0 ? (
                      <div className="material-type-grid">
                        {selectedCourseMaterialGroups.map((group) => {
                          const isExpanded = selectedFileMaterialType === group.type;

                          return (
                          <article
                            className={isExpanded ? "material-type-card material-bucket-card active expanded" : "material-type-card material-bucket-card"}
                            key={group.type}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedFileMaterialType((current) => current === group.type ? null : group.type)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedFileMaterialType((current) => current === group.type ? null : group.type);
                              }
                            }}
                          >
                            <div className="material-bucket-head">
                              <div>
                                <strong>{materialTypeLabel(group.type)}</strong>
                                <small><Download /> {group.downloads}</small>
                              </div>
                              <span>{group.resources.length} {copy.misc.filesCount}</span>
                            </div>
                            {isExpanded ? (
                            <div className="material-file-list">
                              {group.resources.map((resource) => (
                                <button className="material-file-item resource-file-card" key={resource.title} type="button" onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedResourcePreview(resource);
                                }}>
                                  <div>
                                    <h3>{resource.title}</h3>
                                    <p>{resource.year} - {resource.semester} - {copy.misc.by} {resource.uploader}</p>
                                  </div>
                                  <small><Star /> {resource.rating}</small>
                                  <small><Download /> {resource.downloads}</small>
                                  {canSeeResourceModeration ? <em className={`status ${resource.status.toLowerCase()}`}>{resource.status}</em> : null}
                                </button>
                              ))}
                            </div>
                            ) : (
                              <em className="material-card-hint">{copy.misc.openType}</em>
                            )}
                          </article>
                          );
                        })}
                      </div>
                    ) : (
                      <article className="resource-empty">
                        <BookOpen />
                        <h3>{copy.misc.noCourseFiles}</h3>
                        <p>{copy.misc.commonCourses}</p>
                      </article>
                    )}
                  </section>
                )}
              </section>
            )}
          </PageShell>
        ) : null}

        {activeSection === "questions" ? (
          <PageShell
            label={copy.pages.questions[0]}
            title={copy.pages.questions[1]}
            action={
              <div className="button-row no-margin">
                <button className="btn btn-soft" type="button" onClick={() => requireAccount("anonymous")}><LockKeyhole /> {copy.buttons.anonymous}</button>
                <button className="btn btn-primary" type="button" onClick={() => requireAccount("ask")}><Plus /> {copy.buttons.ask}</button>
              </div>
            }
          >
            <div className="warning-band"><ShieldAlert /> {copy.misc.warning}</div>
            <div className="stack">
              {questions.map((question) => (
                <article className="question-card lift" key={question.title}>
                  <div className="vote-box"><strong>{question.votes}</strong><span>{copy.misc.votes}</span></div>
                  <div>
                    <div className="card-row">
                      <h3>{question.title}</h3>
                      {question.solved ? <span className="status approved"><Check /> {copy.misc.bestAnswer}</span> : null}
                    </div>
                    <p>{question.excerpt}</p>
                    <TagRow tags={[question.category, ...question.tags, question.anonymous ? "Anonymous" : "Public"]} />
                  </div>
                  <div className="answer-box"><strong>{question.answers}</strong><span>{copy.misc.answers}</span><button className="btn btn-soft" type="button" onClick={() => requireAccount("answer")}>{copy.buttons.answer}</button></div>
                </article>
              ))}
            </div>
          </PageShell>
        ) : null}

        {activeSection === "posts" ? (
          <PageShell label={copy.pages.posts[0]} title={copy.pages.posts[1]}>
            <div className="community-summary">
              <span><strong>{currentUser ? accountPostCount : "-"}</strong> {copy.misc.yourActivePosts}</span>
              <span><strong>{currentUser ? accountCommentCount : "-"}</strong> {copy.misc.yourComments}</span>
              <span><strong>{currentUser ? accountLikesReceived : "-"}</strong> {copy.misc.likesReceived}</span>
            </div>

            <div className="posts-layout community-layout">
              <section className="post-composer">
                {currentUser ? (
                  <>
                    <div>
                      <span className="section-label small">{copy.misc.communityPost}</span>
                      <h2>{copy.misc.shareWithStudents}</h2>
                      <p>{copy.misc.postDescription}</p>
                    </div>

                    <div className="post-type-row">
                      {postCategories.map((category) => (
                        <button
                          className={postCategory === category ? "selected" : ""}
                          key={category}
                          type="button"
                          onClick={() => setPostCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={postDraft}
                      maxLength={360}
                      onChange={(event) => setPostDraft(event.target.value)}
                      placeholder={copy.misc.postPlaceholder}
                    />

                    <div className="post-photo-input">
                      <ImagePlus />
                      <input
                        value={postPhoto}
                        onChange={(event) => setPostPhoto(event.target.value)}
                        placeholder="Optional photo URL"
                      />
                      <button type="button" onClick={() => setPostPhoto(campusImages[0])}>{copy.misc.campusPhoto}</button>
                    </div>
                    {postPhoto ? <img className="post-photo-preview" src={postPhoto} alt="Post preview" /> : null}

                    <div className="composer-actions">
                      <span>{postDraft.trim().length}/360</span>
                      <button className="btn btn-primary" type="button" onClick={publishStudentPost}><Megaphone /> {copy.buttons.publish}</button>
                    </div>
                  </>
                ) : (
                  <div className="locked-composer">
                    <LockKeyhole />
                    <span className="section-label small">{copy.misc.loginRequired}</span>
                    <h2>{copy.misc.signInToPublish}</h2>
                    <p>{copy.misc.signInToPublishText}</p>
                    <button className="btn btn-primary" type="button" onClick={() => openAuth("signin")}><LogIn /> {copy.signIn}</button>
                  </div>
                )}
              </section>

              <section className="post-feed community-feed">
                {visibleStudentPosts.map((post) => (
                  <article className="post-card community-post lift" key={post.id}>
                    <div className="post-meta">
                      <span className="avatar">{initials(post.author)}</span>
                      <div>
                        <strong>{post.author}</strong>
                        <small>{post.time} - {post.tag}</small>
                      </div>
                      <span className={post.moderationStatus === "Approved" ? "status approved" : post.moderationStatus === "Pending" ? "status pending" : "status flagged"}>
                        {post.moderationStatus}
                      </span>
                    </div>

                    <p>{post.body}</p>
                    {post.photo ? <img className="post-photo" src={post.photo} alt={`${post.author} post`} /> : null}

                    <div className="post-stats">
                      <span>{post.likes} {copy.misc.likes}</span>
                      <span>{post.comments.length} {copy.misc.comments}</span>
                      <span>{post.reposts} reposts</span>
                      <span>{post.shares} shares</span>
                    </div>

                    <div className="post-actions">
                      <button className={post.likedBy.includes(currentUser?.name ?? "") ? "active" : ""} type="button" onClick={() => likePost(post.id)}><Heart /> {copy.buttons.like}</button>
                      <button type="button" onClick={() => setCommentDrafts((drafts) => ({ ...drafts, [post.id]: drafts[post.id] ?? "" }))}><MessageCircle /> {copy.buttons.comment}</button>
                      <button type="button" onClick={() => repostPost(post.id)}><Repeat2 /> {copy.buttons.repost}</button>
                      <button type="button" onClick={() => sharePost(post.id)}><Share2 /> {copy.buttons.share}</button>
                    </div>

                    <div className="comment-thread">
                      {post.comments.map((comment) => (
                        <div className="comment-row" key={comment.id}>
                          <span className="avatar">{initials(comment.author)}</span>
                          <div>
                            <strong>{comment.author}</strong>
                            <p>{comment.body}</p>
                            <small>{comment.time}</small>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="comment-composer">
                      <input
                        value={commentDrafts[post.id] ?? ""}
                        onChange={(event) => setCommentDrafts((drafts) => ({ ...drafts, [post.id]: event.target.value }))}
                        placeholder={currentUser ? `${copy.buttons.comment}...` : copy.signIn}
                      />
                      <button className="btn btn-primary" type="button" onClick={() => addPostComment(post.id)}><Send /> {copy.buttons.comment}</button>
                    </div>
                  </article>
                ))}
              </section>
            </div>
          </PageShell>
        ) : null}

        {activeSection === "courses" ? (
          <PageShell label={copy.pages.courses[0]} title={copy.pages.courses[1]}>
            <div className="professor-layout">
              <section className="professor-list-panel">
                <div className="section-title compact-title">
                  <span className="section-label">{copy.misc.classrooms}</span>
                  <h2>{copy.misc.chooseProfessor}</h2>
                </div>
                <p className="professor-note">{copy.misc.professorNote}</p>
                <div className="professor-list">
                  {professorProfiles.map((profile) => (
                    <button
                      className={selectedProfessor?.name === profile.name ? "professor-card selected" : "professor-card"}
                      key={profile.name}
                      type="button"
                      onClick={() => setSelectedProfessorName(profile.name)}
                    >
                      <span className="avatar">{initials(professorDisplayName(profile.name))}</span>
                      <span>
                        <strong>{professorDisplayName(profile.name)}</strong>
                        <small>{profile.department}</small>
                        <em>{profile.courses.length} {copy.misc.materialsLabel}</em>
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="professor-detail-panel">
                {!selectedProfessor ? (
                  <article className="classroom-empty glass-panel">
                    <BookOpen />
                    <span className="section-label small">{copy.misc.classroomView}</span>
                    <h2>{copy.misc.openProfessorTitle}</h2>
                    <p>
                      {copy.misc.openProfessorText}
                    </p>
                  </article>
                ) : (
                  <>
                    <article className="professor-hero classroom-hero">
                      <div className="profile-line">
                        <span className="avatar large">{initials(professorDisplayName(selectedProfessor.name))}</span>
                        <div>
                          <span className="section-label small">{selectedProfessor.department}</span>
                          <h2>{professorDisplayName(selectedProfessor.name)} - {copy.misc.classroom}</h2>
                          <p>{professorBioLabel(selectedProfessor.bio)}</p>
                        </div>
                      </div>
                      <div className="professor-stats">
                        <span><strong>{selectedProfessor.courses.length}</strong> {copy.misc.total}</span>
                        <span><strong>{visibleProfessorCourses.length}</strong> {copy.misc.visible}</span>
                        <span><strong>{studentLevel ?? copy.misc.all}</strong> {copy.misc.level}</span>
                      </div>
                    </article>

                    {canUploadProfessorCourse ? (
                      <article className="professor-upload">
                        <div className="card-row">
                          <div>
                            <span className="section-label small">{copy.misc.professorUpload}</span>
                            <h3>{copy.misc.addCourseMaterial}</h3>
                            <p>{copy.misc.uploadHelp}</p>
                          </div>
                          <span className="status approved">{currentUser.name}</span>
                        </div>
                        <div className="professor-upload-grid">
                          <label>{copy.misc.typeLabel}
                            <select value={professorUpload.type} onChange={(event) => setProfessorUpload((upload) => ({ ...upload, type: event.target.value }))}>
                              {materialTypes.map((material) => <option key={material} value={material}>{materialTypeLabel(material)}</option>)}
                            </select>
                          </label>
                          <label>{copy.misc.yearLabel}
                            <select value={professorUpload.year} onChange={(event) => setProfessorUpload((upload) => ({ ...upload, year: event.target.value }))}>
                              {resourceYears.filter((option) => option !== "All years").map((option) => <option key={option}>{option}</option>)}
                            </select>
                          </label>
                          <label>{copy.misc.semesterLabel}
                            <input value={professorUpload.semester} onChange={(event) => setProfessorUpload((upload) => ({ ...upload, semester: event.target.value }))} />
                          </label>
                        </div>
                        <label className="upload-title">{copy.misc.courseTitle}
                          <input value={professorUpload.title} onChange={(event) => setProfessorUpload((upload) => ({ ...upload, title: event.target.value }))} placeholder={copy.misc.courseTitlePlaceholder} />
                        </label>
                        <textarea value={professorUpload.description} onChange={(event) => setProfessorUpload((upload) => ({ ...upload, description: event.target.value }))} placeholder={copy.misc.materialDescriptionPlaceholder} />
                        <button className="btn btn-primary" type="button" onClick={uploadProfessorCourse}><Upload /> {copy.misc.uploadToClassroom}</button>
                      </article>
                    ) : currentUser?.accountType === "Professor" ? (
                      <div className="warning-band"><ShieldCheck /> {copy.misc.ownClassroomWarning}</div>
                    ) : null}

                    <div className="classroom-stream">
                      <section className="classroom-main">
                        <div className="classroom-toolbar">
                          <SectionTitle label={copy.misc.classwork} title={copy.misc.courseMaterials} />
                          {currentUser?.accountType === "Student" ? <span className="status approved">{copy.misc.showing} {studentLevel}</span> : null}
                        </div>
                        {visibleProfessorCourses.length > 0 ? (
                          <div className="course-materials classroom-materials">
                            {visibleProfessorCourses.map((course) => (
                              <article className="course-material-card lift" key={course.id}>
                                <div className="card-row">
                                  <span className="status approved">{materialTypeLabel(course.type)}</span>
                                  <small>{timingLabel(course.uploadedAt)}</small>
                                </div>
                                <h3>{courseTitleLabel(course.title)}</h3>
                                <p>{courseDescriptionLabel(course.description)}</p>
                                <TagRow tags={[course.year, course.semester]} />
                                <button className="btn btn-soft" type="button" onClick={() => setToast(`${copy.misc.openMaterial}: ${courseTitleLabel(course.title)}.`)}>{copy.misc.openMaterial}</button>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <article className="course-empty">
                            <BookOpen />
                            <h3>{currentUser ? copy.misc.noMaterialsLevel : copy.misc.signInMaterial}</h3>
                            <p>
                              {currentUser?.accountType === "Student"
                                ? `${copy.misc.noVisiblePrefix} ${studentLevel}${language === "fr" ? " pour le moment." : " yet."}`
                                : copy.misc.studentLevelOnly}
                            </p>
                          </article>
                        )}
                      </section>

                      <aside className="classroom-about">
                        <span className="section-label small">{copy.misc.about}</span>
                        <h3>{copy.misc.classroomHow}</h3>
                        <p>{copy.misc.classroomHowText}</p>
                        <TagRow tags={[professorRoleLabel(selectedProfessor.role), selectedProfessor.department]} />
                      </aside>
                    </div>
                  </>
                )}
              </section>
            </div>
          </PageShell>
        ) : null}

        {activeSection === "connect" ? (
          <PageShell label={copy.pages.connect[0]} title={copy.pages.connect[1]}>
            <div className="connect-layout single">
              <div className="glass-panel">
                <label className="search-field">
                  <Search />
                  <input value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} placeholder="Search by name or skill: Student Alpha, React, SQL..." />
                </label>
                <div className="student-list">
                  {filteredStudents.length > 0 ? filteredStudents.map((profile) => {
                    const profileStatus = getStudentStatus(profile);

                    return (
                      <article
                        className={selectedStudent.name === profile.name ? "student-card selected" : "student-card"}
                        key={profile.name}
                      >
                        <span className="avatar">{initials(profile.name)}</span>
                        <span>
                          <strong>{profile.name}</strong>
                          <small>{profile.year} - {profile.group} - {profile.specialty} - {getPointBalance(profile.name)} pts</small>
                          <TagRow tags={profile.skills.slice(0, 3)} />
                        </span>
                        <span className={`presence ${statusClass(profileStatus)}`}>{profileStatus}</span>
                        <button className="btn btn-primary" type="button" onClick={() => {
                          setSelectedStudent(profile);
                          goTo("messages");
                        }}><Send /> Message</button>
                      </article>
                    );
                  }) : (
                    <div className="empty-mini">
                      <Search />
                      <strong>No matching student found</strong>
                      <span>Try a name or a skill like React, Java, SQL, Networks, PHP.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PageShell>
        ) : null}

        {activeSection === "messages" ? (
          <PageShell
            label={copy.pages.messages[0]}
            title={copy.pages.messages[1]}
            action={<button className="btn btn-primary" type="button" onClick={() => goTo("connect")}><Search /> {copy.buttons.findStudent}</button>}
          >
            <div className="messages-layout">
              <aside className="history-panel">
                <SectionTitle label={copy.misc.history} title={copy.misc.studentsContacted} />
                <div className="history-list">
                  {chatHistory.map((profile) => {
                    const profileStatus = getStudentStatus(profile);

                    return (
                      <button
                        className={selectedStudent.name === profile.name ? "history-item selected" : "history-item"}
                        key={profile.name}
                        type="button"
                        onClick={() => setSelectedStudent(profile)}
                      >
                        <span className="avatar">{initials(profile.name)}</span>
                        <span>
                          <strong>{profile.name}</strong>
                          <small>{(sentMessages[profile.name] ?? ["No messages yet"])[(sentMessages[profile.name]?.length ?? 1) - 1]}</small>
                          <span className={`presence compact ${statusClass(profileStatus)}`}>{profileStatus}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="message-panel solo">
                <div className="chat-toolbar">
                  <span><ShieldCheck /> {copy.misc.privateContact}</span>
                </div>
                <div className="profile-line">
                  <span className="avatar large">{initials(selectedStudent.name)}</span>
                  <div>
                    <h2>{selectedStudent.name}</h2>
                    <p>{selectedStudent.year} - {selectedStudent.group} - {selectedStudent.lookingFor}</p>
                  </div>
                  <div className="chat-profile-actions">
                    <span className={`presence ${statusClass(selectedStudentStatus)}`}>{selectedStudentStatus}</span>
                    <span className="points">{selectedStudentPoints} pts</span>
                  </div>
                </div>
                <TagRow tags={[...selectedStudent.skills, ...selectedStudent.interests]} />
                <div className="chat-box tall">
                  <div className="chat-note"><LockKeyhole /> {copy.misc.privateReportable}</div>
                  {(sentMessages[selectedStudent.name] ?? ["Asslema, can we revise one TD together this week?"]).map((item, index) => (
                    <div className="chat-bubble" key={`${item}-${index}`}>{item}</div>
                  ))}
                </div>
                <div className="composer">
                  <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={currentUser ? copy.misc.writePrivate : copy.misc.signInToMessage} />
                  <button className="btn btn-primary" type="button" onClick={sendPrivateMessage}><Send /> {copy.buttons.send}</button>
                </div>
              </div>
            </div>
          </PageShell>
        ) : null}

        {activeSection === "bot" ? (
          <PageShell label={copy.pages.bot[0]} title={copy.pages.bot[1]}>
            <div className="bot-layout">
              <section className="bot-panel">
                <div className="bot-hero">
                  <span className="bot-mark"><Bot /></span>
                  <div>
                    <span className="section-label small">Campus assistant</span>
                    <h2>{copy.misc.botHelp}</h2>
                    <p>{copy.misc.botText}</p>
                  </div>
                </div>

                <div className="bot-chat">
                  {botMessages.map((item) => (
                    <div className={item.sender === "bot" ? "bot-bubble bot-answer" : "bot-bubble bot-user"} key={item.id}>
                      {item.sender === "bot" ? <Bot /> : <span className="avatar">{initials(currentUser?.name ?? "You")}</span>}
                      <p>{item.body}</p>
                    </div>
                  ))}
                </div>

                <div className="bot-composer">
                  <input
                    value={botDraft}
                    onChange={(event) => setBotDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        sendBotMessage();
                      }
                    }}
                    placeholder="Ask ISI Bot..."
                  />
                  <button className="btn btn-primary" type="button" onClick={() => sendBotMessage()}><Send /> {copy.buttons.send}</button>
                </div>
              </section>

              <aside className="bot-side">
                <span className="section-label small">{copy.misc.quickPrompts}</span>
                <h3>{copy.misc.startFast}</h3>
                <div className="bot-prompts">
                  {botSuggestions.map((suggestion) => (
                    <button type="button" key={suggestion} onClick={() => sendBotMessage(suggestion)}>
                      <Sparkles /> {suggestion}
                    </button>
                  ))}
                </div>
                <div className="bot-help-card">
                  <strong>Tip</strong>
                  <p>Try: “show me the tutorial”, “I have 4 absences out of 20”, “I am new here”, or “find old exams for Java”.</p>
                </div>
              </aside>
            </div>
          </PageShell>
        ) : null}

        {activeSection === "events" ? (
          <PageShell
            label={copy.pages.events[0]}
            title={copy.pages.events[1]}
            action={<button className="btn btn-primary" type="button" onClick={() => requireAccount("event")}><CalendarDays /> {copy.buttons.createEvent}</button>}
          >
            <div className="split-layout">
              <div className="stack">
                {events.map((event) => (
                  <article className="event-card lift" key={event.title}>
                    <div className="event-icon"><CalendarDays /></div>
                    <div>
                      <h3>{event.title}</h3>
                      <p>{event.organizer} - {event.date} - {event.location}</p>
                    </div>
                    <button className="btn btn-soft" type="button" onClick={() => joinEvent(event.title)}>{copy.buttons.join}</button>
                  </article>
                ))}
              </div>
              <div className="card-grid two">
                {clubs.map((club) => (
                  <article className="club-card lift" key={club.name}>
                    <span className="avatar">{initials(club.name)}</span>
                    <h3>{club.name}</h3>
                    <p>{club.focus}</p>
                    <strong>{club.members} members</strong>
                  </article>
                ))}
              </div>
            </div>
          </PageShell>
        ) : null}

        {activeSection === "profile" ? (
          currentUser ? (
            <PageShell label="Profile" title={`${currentUser.name} - ${currentUser.accountType}`}>
              <div className="split-layout profile-layout">
                <div className="glass-panel profile-card-main">
                  <div className="profile-line">
                    <span className="avatar large">{initials(currentUser.name)}</span>
                    <div>
                      <h2>{currentUser.name}</h2>
                      <p>{currentUser.email}</p>
                    </div>
                  </div>
                  <TagRow tags={["Python", "Java", "PHP", "Databases", "React", "AI"]} />
                  <div className="status-switcher">
                    <div>
                      <span className="section-label small">{copy.misc.status}</span>
                      <span className={`presence ${statusClass(currentAccountStatus)}`}>{currentAccountStatus}</span>
                    </div>
                    <p>{copy.misc.statusHelp}</p>
                  </div>
                  <div className="points-panel">
                    <span className="section-label small">{copy.misc.reputation}</span>
                    <strong>{currentPoints} pts</strong>
                    <p>{currentPointLevel.title}</p>
                    <div className="points-progress" aria-hidden="true"><span style={{ width: `${pointProgress}%` }} /></div>
                  </div>
                  <div className="profile-actions">
                    <button className="btn btn-primary" type="button" onClick={() => requireAccount("profile")}>{copy.buttons.editProfile}</button>
                    <button className="btn btn-soft danger-action" type="button" onClick={disconnectAccount}><LogOut /> {copy.disconnect}</button>
                  </div>
                </div>
                <div className="glass-panel profile-badges">
                  <h2>{copy.misc.pointsAndBadges}</h2>
                  <div className="profile-stats">
                    <span><strong>{currentPoints}</strong> {copy.misc.points}</span>
                    <span><strong>{accountPostCount}</strong> {copy.misc.posts}</span>
                    <span><strong>{accountCommentCount}</strong> {copy.misc.comments}</span>
                    <span><strong>{accountLikesReceived}</strong> {copy.misc.likes}</span>
                  </div>
                  <div className="points-ledger">
                    <h3>{copy.misc.recentPoints}</h3>
                    {currentPointLedger.length > 0 ? currentPointLedger.map((entry) => (
                      <div className="ledger-row" key={entry.id}>
                        <span className={entry.amount >= 0 ? "ledger-score positive" : "ledger-score negative"}>{entry.amount >= 0 ? `+${entry.amount}` : entry.amount}</span>
                        <div>
                          <strong>{entry.reason}</strong>
                          <small>{entry.time}</small>
                        </div>
                      </div>
                    )) : (
                      <p className="muted">{copy.misc.noPointsYet}</p>
                    )}
                  </div>
                  <div className="point-rule-grid">
                    {pointRuleCards.map((rule) => (
                      <span key={rule.label}><strong>+{rule.points}</strong>{rule.label}</span>
                    ))}
                  </div>
                  <div className="badge-grid">
                    {badges.map((badge) => <span key={badge.name}><badge.icon /> {badge.name}</span>)}
                  </div>
                </div>
              </div>
            </PageShell>
          ) : (
            <EmptyState title={language === "fr" ? "Crée un compte pour débloquer ton profil." : "Create an account to unlock your profile."} onClick={() => openAuth("create")} copy={copy} />
          )
        ) : null}

        {activeSection === "admin" ? (
          canModerate ? (
            <PageShell label={copy.pages.admin[0]} title={copy.pages.admin[1]}>
              <div className="admin-summary">
                <span><strong>{pendingAccountRequests.length}</strong> account requests</span>
                <span><strong>{pendingStudentPosts.length}</strong> posts waiting</span>
                <span><strong>{managedAccounts.filter((account) => account.banned).length}</strong> banned accounts</span>
                <span><strong>{managedAccounts.filter((account) => account.accountType === "Moderator").length}</strong> moderators</span>
              </div>

              <div className="admin-board">
                <section className="admin-panel">
                  <SectionTitle label="Accounts" title="Student card approvals" />
                  <div className="admin-list">
                    {pendingAccountRequests.length > 0 ? pendingAccountRequests.map((request) => (
                      <article className="review-card" key={request.id}>
                        <div>
                          <strong>{request.name}</strong>
                          <p>{request.email} - {request.accountType} - {request.year ?? request.department}</p>
                          <small>Student card: {request.studentCard ?? "Not required"}</small>
                        </div>
                        <div className="review-actions">
                          <button className="btn btn-primary" type="button" onClick={() => approveAccountRequest(request.id)}><Check /> {copy.buttons.accept}</button>
                          <button className="btn btn-soft" type="button" onClick={() => rejectAccountRequest(request.id)}><X /> {copy.buttons.reject}</button>
                        </div>
                      </article>
                    )) : <div className="empty-mini"><ShieldCheck /><strong>No pending accounts</strong><span>New student requests will appear here after card upload.</span></div>}
                  </div>
                </section>

                <section className="admin-panel">
                  <SectionTitle label="Posts" title="Accept or reject community posts" />
                  <div className="admin-list">
                    {pendingStudentPosts.length > 0 ? pendingStudentPosts.map((post) => (
                      <article className="review-card" key={post.id}>
                        <div>
                          <strong>{post.author}</strong>
                          <p>{post.body}</p>
                          <small>{post.tag} - {post.time}</small>
                        </div>
                        <div className="review-actions">
                          <button className="btn btn-primary" type="button" onClick={() => moderatePost(post.id, "Approved")}><Check /> {copy.buttons.accept}</button>
                          <button className="btn btn-soft" type="button" onClick={() => moderatePost(post.id, "Rejected")}><X /> {copy.buttons.reject}</button>
                        </div>
                      </article>
                    )) : <div className="empty-mini"><Megaphone /><strong>No pending posts</strong><span>Student posts go public only after approval.</span></div>}
                  </div>
                </section>

                <section className="admin-panel wide-admin-panel">
                  <SectionTitle label="Security" title="Manage approved accounts" />
                  <div className="admin-account-list">
                    {managedAccounts.map((account) => (
                      <article className={account.banned ? "account-row banned" : "account-row"} key={account.name}>
                        <span className="avatar">{initials(account.name)}</span>
                        <div>
                          <strong>{account.name}</strong>
                          <small>{account.email} - {account.accountType}{account.year ? ` - ${account.year}` : ""} - {getPointBalance(account.name)} pts</small>
                        </div>
                        <span className={account.banned ? "status flagged" : "status approved"}>{account.banned ? "Banned" : "Active"}</span>
                        {isAdmin && account.accountType !== "Moderator" ? (
                          <button className="btn btn-soft" type="button" onClick={() => promoteModerator(account.name)}><ShieldCheck /> {copy.buttons.makeModerator}</button>
                        ) : null}
                        {isAdmin && !account.banned ? (
                          <button className="btn btn-soft danger-action" type="button" onClick={() => banAccount(account.name)}><ShieldAlert /> {copy.buttons.ban}</button>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </PageShell>
          ) : (
            <EmptyState title={language === "fr" ? "Accès admin restreint." : "Admin access is restricted."} onClick={() => openAuth("signin")} copy={copy} />
          )
        ) : null}
      </main>

      {authOpen ? (
        <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setAuthOpen(false)} onSubmit={handleAuthSubmit} copy={copy} />
      ) : null}

      {tutorialOpen ? (
        <TutorialModal
          currentUser={currentUser}
          onClose={dismissTutorial}
          onStartTour={startGuidedTour}
        />
      ) : null}

      {activeTourStep ? (
        <TourOverlay
          step={activeTourStep}
          stepIndex={tourStep ?? 0}
          totalSteps={tourSteps.length}
          onBack={() => moveTour(-1)}
          onNext={() => moveTour(1)}
          onCancel={cancelGuidedTour}
        />
      ) : null}

      {resourceUploadOpen ? (
        <ResourceUploadModal
          copy={copy}
          currentUser={currentUser}
          selectedRoom={selectedFileRoom}
          selectedCourse={selectedFileCourse}
          courseOptions={uploadCourseOptions}
          onClose={() => setResourceUploadOpen(false)}
          onSubmit={handleResourceUpload}
        />
      ) : null}

      {selectedResourcePreview ? (
        <ResourcePreviewModal
          copy={copy}
          resource={selectedResourcePreview}
          materialLabel={materialTypeLabel(selectedResourcePreview.type)}
          canSeeModeration={canSeeResourceModeration}
          onClose={() => setSelectedResourcePreview(null)}
          onOpen={() => setToast(`${copy.buttons.open}: ${selectedResourcePreview.title}`)}
          onMessage={() => {
            setSelectedStudent(studentProfiles.find((profile) => profile.name === selectedResourcePreview.uploader) ?? studentProfiles[0]);
            setSelectedResourcePreview(null);
            goTo("messages");
          }}
        />
      ) : null}

      {action ? <ActionModal kind={action} onClose={() => setAction(null)} onSubmit={handleActionSubmit} copy={copy} /> : null}
    </div>
  );
}

function HomeSection({
  goTo,
  openAuth,
  currentUser,
  copy,
  language,
}: {
  goTo: (section: SectionId) => void;
  openAuth: (mode: AuthMode) => void;
  currentUser: Account | null;
  copy: UICopy;
  language: Language;
}) {
  const greetingName = currentUser?.name ?? copy.home.guest;

  return (
    <>
      <section className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> {copy.home.greeting}, {greetingName}</div>
          <h1>{copy.home.title}</h1>
          <p>
            {copy.home.text}
          </p>
          <div className="trust-row">
            <span>{officialFacts.name}</span>
            <span>{officialFacts.certification}</span>
            <span>{officialFacts.address}</span>
          </div>
          <div className="campus-pills">
            {copy.home.pills.map((pill) => <span key={pill}>{pill}</span>)}
          </div>
        </div>

        <div className="visual-stage compact-visual">
          <div className="floating-note right"><strong>ISI Kef</strong><span>{language === "fr" ? "Technologie et savoir : les clés de l'avenir." : "Technology and knowledge for the future."}</span></div>
          <article className="isi-info-card lift">
            <img className="isi-photo" src={campusImages[0]} alt="Institut Superieur d'Informatique du Kef" />
            <div className="isi-info-body">
              <span className="section-label small">{copy.home.officialLabel}</span>
              <h2>{officialFacts.name}</h2>
              <p>
                {copy.home.officialText}
              </p>
              <div className="isi-facts">
                <span>Sciences Informatiques et Web</span>
                <span>Technologie des Réseaux Informatiques</span>
                <span>{language === "fr" ? "Services : inscription, formations, bibliothèque" : "Services: registration, programs, library"}</span>
              </div>
              <a className="official-link" href={officialFacts.site} target="_blank" rel="noreferrer">{copy.home.officialLink}</a>
            </div>
          </article>
        </div>
      </section>

      <section className="card-grid essentials">
        {copy.home.features.map(([title, text, section]) => (
          <button className="feature-card lift" type="button" key={title} onClick={() => goTo(section)}>
            <h3>{title}</h3>
            <p>{text}</p>
            <span>{copy.home.open}</span>
          </button>
        ))}
      </section>

      {!currentUser ? (
        <section className="campus-shortcuts">
          <div>
            <span className="section-label">{copy.home.wannaJoin}</span>
            <h2>{copy.home.createReady}</h2>
          </div>
          <div>
            <button type="button" onClick={() => openAuth("create")}>{copy.home.joinCta}</button>
            <button type="button" onClick={() => goTo("posts")}>{copy.home.seeCommunity}</button>
          </div>
        </section>
      ) : null}
    </>
  );
}

function TutorialModal({
  currentUser,
  onClose,
  onStartTour,
}: {
  currentUser: Account | null;
  onClose: () => void;
  onStartTour: () => void;
}) {
  const level = currentUser?.accountType === "Student" ? currentUser.year ?? "your level" : currentUser?.accountType ?? "student";

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-card tutorial-card">
        <button className="icon-button close" type="button" aria-label="Close" onClick={onClose}><X /></button>
        <span className="bot-mark tutorial-mark"><Bot /></span>
        <span className="section-label">ISI Bot</span>
        <h2>Asslema, {currentUser?.name ?? "student"}.</h2>
        <p>
          I can help you use ISI Connect as a {level}: find TD/TP resources, understand professor classrooms,
          contact students, post in the community, and calculate absence risk from a simple message.
        </p>
        <div className="tutorial-steps">
          <span><strong>1</strong> Search files, posts, students or professors from the top bar.</span>
          <span><strong>2</strong> Ask ISI Bot when you do not know where to go.</span>
          <span><strong>3</strong> For absences, write something like: 3 absences out of 20 sessions.</span>
        </div>
        <div className="tutorial-actions">
          <button className="btn btn-primary" type="button" onClick={onStartTour}><Bot /> Start tour</button>
          <button className="btn btn-soft" type="button" onClick={onClose}>Cancel</button>
        </div>
      </section>
    </div>
  );
}

function TourOverlay({
  step,
  stepIndex,
  totalSteps,
  onBack,
  onNext,
  onCancel,
}: {
  step: { section: SectionId; title: string; text: string };
  stepIndex: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  const isLast = stepIndex === totalSteps - 1;

  return (
    <aside className="tour-coach" aria-live="polite">
      <div className="tour-head">
        <span className="bot-mark tour-mark"><Bot /></span>
        <div>
          <span>ISI Bot tour</span>
          <strong>{stepIndex + 1}/{totalSteps}</strong>
        </div>
      </div>
      <h2>{step.title}</h2>
      <p>{step.text}</p>
      <div className="tour-progress" aria-hidden="true">
        <span style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
      </div>
      <div className="tour-actions">
        <button className="btn btn-soft" type="button" onClick={onCancel}>Cancel tour</button>
        <button className="btn btn-soft" type="button" onClick={onBack} disabled={stepIndex === 0}>Back</button>
        <button className="btn btn-primary" type="button" onClick={onNext}>{isLast ? "Finish" : "Next"}</button>
      </div>
    </aside>
  );
}

function PageShell({ label, title, action, children }: { label: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="page-shell">
      <header className="page-header">
        <div>
          <span className="section-label">{label}</span>
          <h1>{title}</h1>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="section-title">
      <span className="section-label">{label}</span>
      <h2>{title}</h2>
    </div>
  );
}

function SelectBox({
  icon: Icon,
  value,
  options,
  onChange,
}: {
  icon: typeof Filter;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="select-box">
      <Icon />
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function TagRow({ tags }: { tags: string[] }) {
  return <div className="tag-row">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>;
}

function EmptyState({ title, onClick, copy }: { title: string; onClick: () => void; copy: UICopy }) {
  return (
    <section className="empty-state">
      <UserRound />
      <h1>{title}</h1>
      <p>{copy.misc.statusHelp}</p>
      <button className="btn btn-primary" type="button" onClick={onClick}><UserPlus /> {copy.createAccount}</button>
    </section>
  );
}

function createProfessorProfile(account: Account): ProfessorProfile {
  return {
    name: account.name,
    role: "Professor",
    department: account.department || "ISI Kef",
    bio: `Classroom space for ${account.name}: courses, TD, TP, summaries and exam preparation material.`,
    courses: [],
  };
}

function AuthModal({
  mode,
  setMode,
  onClose,
  onSubmit,
  copy,
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onClose: () => void;
  onSubmit: (payload: AuthSubmitPayload) => boolean;
  copy: UICopy;
}) {
  const [name, setName] = useState("Student Alpha");
  const [email, setEmail] = useState("student.alpha@example.test");
  const [password, setPassword] = useState("student123");
  const [accountType, setAccountType] = useState<CreateAccountType>("Student");
  const [year, setYear] = useState("2nd year");
  const [department, setDepartment] = useState("Sciences Informatiques et Web");
  const [studentCard, setStudentCard] = useState("");
  const [modalError, setModalError] = useState("");
  const isStudent = accountType === "Student";
  const isProfessor = accountType === "Professor";

  function submit() {
    setModalError("");
    const cleanName = name.trim();
    const cleanPassword = password.trim();
    if (!cleanName || !cleanPassword) {
      setModalError("Full name and password are required.");
      return;
    }

    if (mode === "signin") {
      onSubmit({ mode: "signin", name: cleanName, password: cleanPassword });
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setModalError("Email is required to create an account.");
      return;
    }
    if (isStudent && !studentCard) {
      setModalError("Upload your student card before sending the request.");
      return;
    }

    onSubmit({
      mode: "create",
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      accountType,
      year: isStudent ? year : undefined,
      department: isProfessor ? department : undefined,
      studentCard: isStudent ? studentCard : undefined,
    });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button className="icon-button close" type="button" aria-label="Close" onClick={onClose}><X /></button>
        <span className="section-label">{mode === "create" ? copy.auth.createLabel : copy.auth.signInLabel}</span>
        <h2>{mode === "create" ? copy.auth.createTitle : copy.auth.signInTitle}</h2>
        <label>{copy.auth.fullName}<input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>{copy.auth.password}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {mode === "signin" ? (
          <>
            <button className="text-button auth-help" type="button" onClick={() => setModalError("Password reset demo: contact an admin or use your verified campus email.")}>{copy.auth.forgot}</button>
            <small className="auth-hint">{enableDemoAdmin ? copy.auth.demoAdmin : copy.auth.demoStudent}</small>
          </>
        ) : (
          <>
            <label>{copy.auth.email}<input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            <label>{copy.auth.accountType}
              <select value={accountType} onChange={(event) => setAccountType(event.target.value as CreateAccountType)}>
                {accountTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            {isStudent ? (
              <>
                <label>{copy.auth.studentLevel}
                  <select value={year} onChange={(event) => setYear(event.target.value)}>
                    {resourceYears.filter((option) => option !== "All years").map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>{copy.auth.studentCard}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(event) => setStudentCard(event.target.files?.[0]?.name ?? "")}
                  />
                  <small>{studentCard ? `Ready: ${studentCard}` : copy.auth.studentCardRequired}</small>
                </label>
              </>
            ) : null}
            {isProfessor ? (
              <label>{copy.auth.department}
                <input value={department} onChange={(event) => setDepartment(event.target.value)} />
                <small>{copy.auth.professorNoCard}</small>
              </label>
            ) : null}
          </>
        )}
        {modalError ? <p className="modal-error">{modalError}</p> : null}
        <button className="btn btn-primary full" type="button" onClick={submit}>
          <LogIn /> {mode === "create" ? copy.createAccount : copy.signIn}
        </button>
        <button className="text-button" type="button" onClick={() => setMode(mode === "create" ? "signin" : "create")}>
          {mode === "create" ? copy.auth.already : copy.auth.needAccount}
        </button>
      </div>
    </div>
  );
}

function ResourceUploadModal({
  copy,
  currentUser,
  selectedRoom,
  selectedCourse,
  courseOptions,
  onClose,
  onSubmit,
}: {
  copy: UICopy;
  currentUser: Account | null;
  selectedRoom: FileRoom | null;
  selectedCourse: string | null;
  courseOptions: string[];
  onClose: () => void;
  onSubmit: (payload: ResourceUploadPayload) => void;
}) {
  const [program, setProgram] = useState<FileProgram>(selectedRoom?.program ?? "CS");
  const [year, setYear] = useState(selectedRoom?.year ?? currentUser?.year ?? "2nd year");
  const [subject, setSubject] = useState(selectedCourse ?? courseOptions[0] ?? "Databases");
  const [materialType, setMaterialType] = useState("Course");
  const [semester, setSemester] = useState("S1");
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [tags, setTags] = useState("");
  const [modalError, setModalError] = useState("");
  const options = Array.from(new Set([selectedCourse, ...courseOptions].filter(Boolean))) as string[];

  function submit() {
    const cleanTitle = title.trim();
    const cleanSubject = subject.trim();
    if (!cleanTitle || !cleanSubject || !fileName) {
      setModalError("Course, title and file are required.");
      return;
    }

    onSubmit({
      program,
      year,
      subject: cleanSubject,
      type: materialType,
      semester,
      title: cleanTitle,
      fileName,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card resource-upload-card">
        <button className="icon-button close" type="button" aria-label="Close" onClick={onClose}><X /></button>
        <span className="section-label">{copy.buttons.upload}</span>
        <h2>{copy.misc.uploadResourceTitle}</h2>
        <p>{copy.misc.uploadResourceText}</p>
        <div className="form-grid">
          <label>{copy.misc.programLabel}
            <select value={program} onChange={(event) => setProgram(event.target.value as FileProgram)}>
              {filePrograms.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>{copy.misc.yearLabel}
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              {fileRoomYears.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>{copy.misc.chooseCourse}
            <input list="resource-course-options" value={subject} onChange={(event) => setSubject(event.target.value)} />
            <datalist id="resource-course-options">
              {options.map((option) => <option key={option} value={option} />)}
            </datalist>
          </label>
          <label>{copy.misc.typeLabel}
            <select value={materialType} onChange={(event) => setMaterialType(event.target.value)}>
              {resourceTypes.filter((item) => item !== "All types").map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>{copy.misc.semesterLabel}
            <input value={semester} onChange={(event) => setSemester(event.target.value)} />
          </label>
          <label>{copy.misc.fileLabel}
            <input type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
            <small>{fileName ? `${copy.misc.fileReady}: ${fileName}` : copy.misc.uploadFilePlaceholder}</small>
          </label>
        </div>
        <label>{copy.misc.courseTitle}
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={copy.misc.courseTitlePlaceholder} />
        </label>
        <label>Tags
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder={copy.misc.tagsPlaceholder} />
        </label>
        {modalError ? <p className="modal-error">{modalError}</p> : null}
        <button className="btn btn-primary full" type="button" onClick={submit}>
          <Upload /> {copy.buttons.upload}
        </button>
      </div>
    </div>
  );
}

function ResourcePreviewModal({
  copy,
  resource,
  materialLabel,
  canSeeModeration,
  onClose,
  onOpen,
  onMessage,
}: {
  copy: UICopy;
  resource: Resource;
  materialLabel: string;
  canSeeModeration: boolean;
  onClose: () => void;
  onOpen: () => void;
  onMessage: () => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card resource-preview-card">
        <button className="icon-button close" type="button" aria-label="Close" onClick={onClose}><X /></button>
        <span className="section-label">{copy.misc.previewResource}</span>
        <div className="card-row">
          <span className="status approved">{materialLabel}</span>
          {canSeeModeration ? <span className={`status ${resource.status.toLowerCase()}`}>{resource.status}</span> : null}
        </div>
        <h2>{resource.title}</h2>
        <p>{resource.subject} - {resource.year} - {resource.semester}</p>
        <TagRow tags={resource.tags} />
        <div className="resource-preview-stats">
          <span><Star /> {resource.rating}</span>
          <span><Download /> {resource.downloads}</span>
          <span>{copy.misc.by} {resource.uploader}</span>
        </div>
        <div className="button-row">
          <button className="btn btn-primary" type="button" onClick={onOpen}><BookOpen /> {copy.buttons.open}</button>
          <button className="btn btn-soft" type="button" onClick={onMessage}>{copy.buttons.messageUploader}</button>
        </div>
      </div>
    </div>
  );
}

function ActionModal({ kind, onClose, onSubmit, copy }: { kind: ActionKind; onClose: () => void; onSubmit: (kind: ActionKind) => void; copy: UICopy }) {
  const modalCopy = actionCopy[kind];
  const [value, setValue] = useState(modalCopy.placeholder);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button className="icon-button close" type="button" aria-label="Close" onClick={onClose}><X /></button>
        <span className="section-label">{modalCopy.label}</span>
        <h2>{modalCopy.title}</h2>
        <p>{modalCopy.text}</p>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} />
        <button className="btn btn-primary full" type="button" onClick={() => {
          onSubmit(kind);
        }}>
          <Send /> {copy.buttons.submit}
        </button>
      </div>
    </div>
  );
}

const actionCopy: Record<ActionKind, { label: string; title: string; text: string; placeholder: string; success: string }> = {
  ask: { label: "Question", title: "Ask a question", text: "Add context and tags for classmates.", placeholder: "What should I revise first?", success: "Question posted." },
  anonymous: { label: "Anonymous", title: "Ask anonymously", text: "Anonymous posts go to moderation first.", placeholder: "I need advice about exams.", success: "Anonymous question sent for review." },
  upload: { label: "Resource", title: "Upload resource", text: "Uploads are approved before publishing.", placeholder: "Database TD correction PDF.", success: "Resource submitted for approval." },
  answer: { label: "Answer", title: "Write an answer", text: "Helpful answers can become best answers.", placeholder: "Here is how I solve it...", success: "Answer posted." },
  event: { label: "Event", title: "Create event", text: "Club events can be featured after review.", placeholder: "Workshop title, room, date.", success: "Event request submitted." },
  profile: { label: "Profile", title: "Edit profile", text: "Update skills and privacy settings.", placeholder: "Python, Java, SQL...", success: "Profile updated." },
  reports: { label: "Reports", title: "Review reports", text: "Moderation queue opened.", placeholder: "Report details.", success: "Reports opened." },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function searchable(value: unknown) {
  return JSON.stringify(value).toLowerCase();
}

function buildBotAnswer(question: string, currentUser: Account | null) {
  const text = question.toLowerCase();
  const terms = text
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2 && !["how", "can", "with", "find", "help", "need", "want", "resources", "resource", "course", "student"].includes(term));
  const hasAny = (...words: string[]) => words.some((word) => text.includes(word));
  const formatList = (items: string[]) => items.map((item) => `- ${item}`).join("\n");
  const profileName = currentUser?.name ?? "student";
  const profileLevel = currentUser?.accountType === "Student" ? currentUser.year ?? "your level" : currentUser?.accountType ?? "visitor";

  if (hasAny("tutorial", "use the app", "how to use", "start", "first time", "new student", "new here", "freshman")) {
    return [
      `Asslema ${profileName}. Here is the fastest way to use ISI Connect as ${profileLevel}:`,
      formatList([
        "Home: quick overview and official ISI Kef context.",
        "Files: search TD, TP, summaries, corrections and old exams.",
        "Questions: ask classmates or answer academic questions.",
        "Professors: open a professor classroom and see materials for your level.",
        "Students and Chat: find classmates by name or skill, then contact them privately.",
        "Posts: publish campus announcements, photos or study updates after moderation.",
        "ISI Bot: ask for absence calculations, study plans, app help or campus advice.",
      ]),
      "You can cancel the intro any time; ISI Bot stays available in the menu.",
    ].join("\n");
  }

  if (hasAny("absence", "absent", "absences", "elimin", "elimination")) {
    const fraction = text.match(/(\d+)\s*\/\s*(\d+)/);
    const numbers = [...text.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
    const absenceCount = fraction ? Number(fraction[1]) : numbers[0];
    const total = fraction ? Number(fraction[2]) : numbers[1];
    const thresholdMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
    const threshold = thresholdMatch ? Number(thresholdMatch[1]) : numbers[2] && numbers[2] <= 100 ? numbers[2] : 20;

    if (Number.isFinite(absenceCount) && Number.isFinite(total) && total > 0) {
      const rate = (absenceCount / total) * 100;
      const allowed = Math.floor((threshold / 100) * total);
      const remaining = Math.max(allowed - absenceCount, 0);
      const risky = rate >= threshold;
      return [
        `${profileName}, based on ${absenceCount} absence(s) out of ${total} sessions:`,
        `Absence rate: ${rate.toFixed(1)}%.`,
        `Threshold used: ${threshold}%. Allowed absences: ${allowed}.`,
        risky
          ? "Status: risky. You reached or passed the threshold, so contact the teacher or administration quickly."
          : `Status: still under the threshold. You have about ${remaining} absence(s) left before risk.`,
        `Profile context: ${profileLevel}. If your teacher uses a different threshold, tell me the percentage and I will recalculate.`,
      ].join("\n");
    }

    return [
      `${profileName}, I can calculate absence risk directly here.`,
      "Send it like one of these:",
      formatList([
        "I have 3 absences out of 20 sessions",
        "4/18 absences threshold 25%",
        "BD: 2 absences from 14 sessions",
      ]),
      "Default threshold is 20% if you do not mention one.",
    ].join("\n");
  }

  const matchedStudents = studentProfiles
    .filter((profile) =>
      terms.some((term) =>
        profile.name.toLowerCase().includes(term)
        || profile.skills.some((skill) => skill.toLowerCase().includes(term)),
      ),
    )
    .slice(0, 3);

  if (hasAny("who", "student", "contact", "message", "teach", "learn", "skill") && matchedStudents.length > 0) {
    return [
      "I found students who match your search:",
      formatList(matchedStudents.map((profile) => `${profile.name} - ${profile.skills.slice(0, 3).join(", ")} (${profile.year})`)),
      "Open Students, search the name or skill, then use Message to contact them privately.",
    ].join("\n");
  }

  const matchedResources = resources
    .filter((resource) => terms.some((term) => searchable(resource).includes(term)) || (hasAny("bd", "database", "sql") && resource.subject.toLowerCase().includes("database")))
    .slice(0, 3);

  if (hasAny("resource", "summary", "old exam", "exam", "td", "tp", "correction", "file", "pdf", "sql", "php", "java") && matchedResources.length > 0) {
    return [
      "Best matching resources:",
      formatList(matchedResources.map((resource) => `${resource.title} - ${resource.type}, ${resource.year}, rating ${resource.rating}/5`)),
      "Open Resources and use the same keyword. If you are blocked, post a focused question with the exercise number.",
    ].join("\n");
  }

  const matchedCourse = courses.find((course) =>
    searchable(course).includes(text)
    || terms.some((term) => searchable(course).includes(term))
    || (hasAny("bd", "database", "sql") && course.name.toLowerCase().includes("donnees"))
    || (hasAny("network", "reseau", "subnet") && course.name.toLowerCase().includes("reseaux"))
  );

  if (matchedCourse) {
    return [
      `${matchedCourse.name} (${matchedCourse.year}, ${matchedCourse.semester})`,
      `Important topics: ${matchedCourse.focus.join(", ")}.`,
      "Suggested method:",
      formatList([
        "Read one short summary first.",
        "Redo TD/TP exercises without looking at the correction.",
        "Write a mistakes list.",
        "Finish with one old exam or mixed practice sheet.",
      ]),
    ].join("\n");
  }

  const daysMatch = text.match(/\b(\d+)\s*(day|days|jour|jours)\b/);
  const days = daysMatch ? Math.min(Number(daysMatch[1]), 7) : 3;
  if (hasAny("plan", "revise", "study", "prepare", "exam")) {
    return [
      `Here is a ${days}-day revision plan:`,
      formatList([
        "Day 1: list chapters, read summaries, mark weak points.",
        "Day 2: redo TD/TP exercises and correct mistakes.",
        "Day 3: solve an old exam, then ask one precise question in Q&A.",
      ].slice(0, Math.max(1, Math.min(days, 3)))),
      "If you tell me the module name, I can make the plan more specific.",
    ].join("\n");
  }

  if (hasAny("prof", "teacher", "classroom", "upload")) {
    return "Open Professors, choose a professor profile, then enter the classroom. Professor accounts can upload material; student accounts only see material matching their level.";
  }

  if (hasAny("admin", "document", "transport", "housing", "library", "official", "contact")) {
    return [
      "For campus basics, here is the useful path:",
      formatList([
        `Official contact: ${officialFacts.email}`,
        `Address: ${officialFacts.address}`,
        "Use Home for the official ISI Kef site link.",
        "Use ISI Bot for quick guidance before asking administration.",
      ]),
      "For documents, transport or housing, ask me the exact problem and I will turn it into steps.",
    ].join("\n");
  }

  if (hasAny("event", "club", "workshop")) {
    return [
      "Upcoming campus activities:",
      formatList(events.slice(0, 3).map((event) => `${event.title} - ${event.date}, ${event.location}`)),
      "Open Events to join or follow club activity.",
    ].join("\n");
  }

  return [
    "I can help better if you include one keyword: a module, skill, or problem.",
    "Examples:",
    formatList([
      "Find SQL old exams",
      "Who can help with React?",
      "I have BD exam in 3 days",
      "I have 3 absences out of 20 sessions",
      "Show me how to use ISI Connect",
    ]),
  ].join("\n");
}

const appStyles = `
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0f172a; background: #f8fafc; }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
svg { width: 18px; height: 18px; flex: 0 0 auto; }
.app { min-height: 100vh; overflow-x: hidden; background: radial-gradient(circle at 8% 0%, rgba(37, 99, 235, 0.14), transparent 28%), radial-gradient(circle at 92% 10%, rgba(6, 182, 212, 0.18), transparent 30%), linear-gradient(180deg, #ffffff 0%, #f8fafc 44%, #eef2ff 100%); position: relative; padding-bottom: 64px; color: #0f172a; transition: color 0.38s ease; }
.app::before { content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none; background: #000000; opacity: 0; transition: opacity 0.42s ease; }
.app.dark { color: #ffffff; }
.app.dark::before { opacity: 1; }
.dark .light-beam { opacity: 0.08; }
.dark .noise { opacity: 0.025; }
.container { width: min(1180px, calc(100% - 32px)); margin: 0 auto; position: relative; z-index: 2; }
.noise { position: fixed; inset: 0; pointer-events: none; opacity: 0.045; background-image: linear-gradient(90deg, #0f172a 1px, transparent 1px), linear-gradient(#0f172a 1px, transparent 1px); background-size: 42px 42px; mask-image: linear-gradient(to bottom, black, transparent 75%); }
.light-beam { position: fixed; pointer-events: none; width: 55vw; height: 160px; border-radius: 999px; filter: blur(42px); opacity: 0.32; transform: rotate(-12deg); }
.beam-one { left: -8vw; top: 110px; background: linear-gradient(90deg, rgba(37, 99, 235, 0.35), rgba(6, 182, 212, 0)); }
.beam-two { right: -14vw; top: 42vh; background: linear-gradient(90deg, rgba(124, 58, 237, 0), rgba(6, 182, 212, 0.34)); }
.navbar { position: sticky; top: 14px; z-index: 140; width: min(1180px, calc(100% - 32px)); margin: 14px auto 22px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 12px 14px; border: 2px solid #bfdbfe; background: #eaf2ff !important; opacity: 1; border-radius: 28px; box-shadow: 0 24px 80px rgba(15, 23, 42, 0.14); animation: navIn 0.7s ease both; transition: background-color 0.38s ease, border-color 0.38s ease, box-shadow 0.38s ease, color 0.38s ease; }
.dark .navbar { background: #000000 !important; border-color: #1f2937; box-shadow: 0 24px 80px rgba(0,0,0,0.65); }
.brand, .side-menu button, .icon-button, .btn, .quick-grid button, .feature-card, .guide-card { border: 0; display: inline-flex; align-items: center; gap: 10px; }
.brand { background: transparent; color: inherit; text-align: left; }
.brand-mark { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 17px; color: #fff; font-weight: 950; letter-spacing: -0.06em; background: linear-gradient(135deg, #2563eb, #1d4ed8 54%, #06b6d4); box-shadow: 0 18px 35px rgba(37, 99, 235, 0.28); }
.brand-mark.logo-mark { overflow: hidden; background: #ffffff; border: 2px solid rgba(255,255,255,0.45); padding: 4px; }
.brand-mark.logo-mark img { width: 100%; height: 100%; object-fit: contain; border-radius: 12px; }
.brand strong, .brand small { display: block; }
.brand small { color: #64748b; font-size: 0.76rem; font-weight: 720; margin-top: 1px; }
.dark .brand small, .dark p, .dark li, .dark small, .dark .muted, .dark .card-row.muted, .dark .student-card small { color: #ffffff; }
.menu-button { display: inline-grid; place-items: center; border: 1px solid #e2e8f0; width: 44px; height: 44px; border-radius: 16px; background: rgba(255,255,255,0.88); color: #0f172a; transition: background-color 0.34s ease, color 0.34s ease, border-color 0.34s ease, box-shadow 0.34s ease, transform 0.24s ease; }
.dark .menu-button { border-color: #1f2937; background: #000000; color: #ffffff; box-shadow: 0 18px 44px rgba(0,0,0,0.4); }
.side-menu { position: fixed; inset: 0 auto 0 0; z-index: 1000; width: clamp(420px, 34vw, 520px); display: grid; grid-template-rows: auto 1fr auto; gap: 24px; padding: 28px; color: #eff6ff; background: #1e3a8a; background-image: linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 58%, #0e7490 100%); border-right: 4px solid #67e8f9; box-shadow: 24px 0 90px rgba(15,23,42,0.42); transform: translateX(-105%); transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s linear 0.32s; overflow-y: auto; opacity: 1; visibility: hidden; pointer-events: none; backdrop-filter: none; -webkit-backdrop-filter: none; will-change: transform; }
.side-menu.open { transform: translateX(0); visibility: visible; pointer-events: auto; transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s; }
.side-menu-header { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 10px 0 22px; border-bottom: 1px solid rgba(255,255,255,0.22); }
.side-menu-header strong, .side-menu-header small { display: block; }
.side-menu-header .brand-mark { width: 56px; height: 56px; border-radius: 20px; }
.side-menu-header strong { color: #ffffff; letter-spacing: -0.04em; font-size: 1.2rem; }
.side-menu-header small { margin-top: 3px; color: #dbeafe; font-weight: 760; }
.side-close { justify-content: center; width: 48px; height: 48px; border-radius: 17px; color: #ffffff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); }
.side-menu-body { display: grid; align-content: start; gap: 11px; }
.menu-label { display: block; margin: 2px 0 6px; color: #bfdbfe; font-size: 0.78rem; font-weight: 950; letter-spacing: 0.11em; text-transform: uppercase; }
.menu-item { width: 100%; min-height: 58px; justify-content: flex-start; padding: 0 18px; border-radius: 20px; color: #eff6ff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); font-size: 1rem; font-weight: 880; transition: background 0.22s ease, color 0.22s ease, transform 0.22s ease; }
.menu-item svg { width: 21px; height: 21px; opacity: 1; visibility: visible; }
.menu-item:hover, .menu-item.active { color: #1d4ed8; background: #ffffff; border-color: #ffffff; transform: translateX(4px); }
.side-menu-footer { display: grid; gap: 12px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.22); }
.menu-account { width: 100%; justify-content: flex-start; padding: 14px; border-radius: 22px; color: #ffffff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); text-align: left; }
.menu-account .avatar { margin-left: 0; border-color: rgba(255,255,255,0.4); }
.menu-account strong, .menu-account small { display: block; }
.menu-account small { margin-top: 3px; color: #dbeafe; }
.menu-auth { display: grid; grid-template-columns: 1fr; gap: 8px; }
.menu-auth button { min-height: 46px; justify-content: center; border-radius: 999px; color: #1d4ed8; background: #ffffff; font-weight: 900; }
.menu-auth button:first-child { color: #eff6ff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); }
.menu-disconnect { min-height: 48px; justify-content: center; border-radius: 999px; color: #ffffff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); font-weight: 920; transition: transform 0.22s ease, background 0.22s ease, color 0.22s ease; }
.menu-disconnect:hover { transform: translateY(-2px); color: #1d4ed8; background: #ffffff; }
.menu-backdrop { position: fixed; inset: 0; z-index: 900; border: 0; background: rgba(15,23,42,0.56); }
.dark .side-menu { background: #000000; background-image: linear-gradient(180deg, #000000 0%, #050505 62%, #0a0a0a 100%); border-color: #2563eb; box-shadow: 24px 0 90px rgba(0,0,0,0.85); }
.dark .side-menu-header small, .dark .menu-label, .dark .menu-account small { color: #ffffff; }
.nav-actions { position: relative; display: flex; align-items: center; justify-content: flex-end; gap: 10px; min-width: max-content; }
.global-search { position: relative; justify-self: stretch; display: flex; align-items: center; gap: 8px; min-height: 46px; width: min(680px, 100%); padding: 0 15px; border-radius: 999px; border: 1px solid #e2e8f0; background: rgba(255,255,255,0.92); box-shadow: inset 0 1px 0 rgba(255,255,255,0.85); }
.global-search input, .search-field input, .composer input, .form-grid input, .modal-card input, .modal-card select, .select-box select, textarea { border: 0; outline: 0; color: inherit; background: transparent; width: 100%; min-height: 40px; }
.global-search input { min-width: 0; flex: 1; }
.search-results { position: absolute; top: calc(100% + 8px); left: 0; right: 0; display: grid; gap: 5px; padding: 8px; border-radius: 20px; border: 1px solid #e2e8f0; background: rgba(255,255,255,0.95); box-shadow: 0 24px 60px rgba(15,23,42,0.14); }
.search-results button { border: 0; border-radius: 16px; background: transparent; text-align: left; padding: 10px; color: #0f172a; }
.search-results span { display: block; color: #64748b; font-size: 0.82rem; margin-top: 3px; }
.dark .search-results { background: #050505; border-color: #1f2937; box-shadow: 0 24px 60px rgba(0,0,0,0.65); }
.dark .search-results button, .dark .search-results span { color: #ffffff; }
.global-search, .search-field, .select-box, .notification-panel, .notification-item, .btn-soft, .toast, .campus-shortcuts, .campus-shortcuts button, .campus-pills span, .search-results { transition: background-color 0.38s ease, color 0.38s ease, border-color 0.38s ease, box-shadow 0.38s ease; }
.icon-button { justify-content: center; width: 44px; height: 44px; border-radius: 16px; border: 1px solid #e2e8f0; background: rgba(255,255,255,0.88); color: inherit; transition: background-color 0.34s ease, color 0.34s ease, border-color 0.34s ease, box-shadow 0.34s ease, transform 0.24s ease; }
.language-toggle { min-height: 44px; display: inline-flex; align-items: center; gap: 7px; padding: 0 12px; border-radius: 16px; border: 1px solid #bfdbfe; color: #1d4ed8; background: #eff6ff; font-weight: 950; transition: transform 0.24s ease, background-color 0.34s ease, color 0.34s ease, border-color 0.34s ease; }
.language-toggle:hover { transform: translateY(-2px); background: #dbeafe; }
.theme-toggle svg { animation: themeIconIn 0.34s ease both; }
.notify-button { position: relative; }
.notification-badge { position: absolute; top: -7px; right: -7px; min-width: 22px; height: 22px; display: grid; place-items: center; padding: 0 6px; border-radius: 999px; color: #fff; background: #ef4444; border: 2px solid #eaf2ff; font-size: 0.72rem; font-weight: 950; }
.notification-panel { position: absolute; top: calc(100% + 12px); right: 0; z-index: 1200; width: min(380px, calc(100vw - 28px)); padding: 14px; border: 1px solid #dbeafe; border-radius: 24px; background: rgba(255,255,255,0.97); box-shadow: 0 28px 80px rgba(15,23,42,0.22); animation: fadeUp 0.22s ease both; }
.notification-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.notification-head button { border: 0; color: #1d4ed8; background: #eff6ff; border-radius: 999px; min-height: 34px; padding: 0 11px; font-weight: 900; }
.notification-list { display: grid; gap: 8px; max-height: 360px; overflow: auto; }
.notification-item { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; padding: 11px; border-radius: 18px; background: #f8fafc; border: 1px solid #e2e8f0; }
.notification-item > span { width: 9px; height: 9px; margin-top: 7px; border-radius: 999px; background: #cbd5e1; }
.notification-item.unread > span { background: #ef4444; box-shadow: 0 0 0 5px rgba(239,68,68,0.16); }
.notification-item strong, .notification-item small { display: block; }
.notification-item p { margin: 3px 0; font-size: 0.9rem; }
.btn { justify-content: center; min-height: 44px; border-radius: 999px; padding: 0 17px; font-weight: 900; transition: transform 0.24s ease, box-shadow 0.24s ease; text-decoration: none; }
.btn:hover, .lift:hover { transform: translateY(-5px); }
.btn-primary { color: #fff; background: linear-gradient(135deg, #2563eb, #06b6d4); box-shadow: 0 18px 38px rgba(37, 99, 235, 0.25); }
.btn-soft { color: #0f172a; background: rgba(255, 255, 255, 0.88); border: 1px solid #e2e8f0; }
.dark .btn-soft, .dark .icon-button, .dark .global-search, .dark .search-field, .dark .select-box, .dark .notification-panel, .dark .glass-card, .dark .glass-panel, .dark .page-header, .dark .stat-card, .dark .feature-card, .dark .question-card, .dark .post-composer, .dark .post-card, .dark .bot-panel, .dark .bot-side, .dark .professor-list-panel, .dark .professor-hero, .dark .professor-upload, .dark .course-material-card, .dark .classroom-about, .dark .course-empty, .dark .club-card, .dark .event-card, .dark .message-panel, .dark .history-panel, .dark .admin-card, .dark .admin-panel, .dark .review-card, .dark .account-row, .dark .result-card, .dark .empty-state, .dark .modal-card, .dark .isi-info-card, .dark .file-program-panel, .dark .resource-room-head, .dark .resource-empty, .dark .course-card, .dark .material-type-card, .dark .course-browser-head { color: #ffffff; background: #050505; border-color: #1f2937; box-shadow: 0 18px 50px rgba(0,0,0,0.55); }
.dark .language-toggle { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.dark .notification-badge { border-color: #000000; }
.dark .notification-head button, .dark .notification-item { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.dark .campus-shortcuts { color: #ffffff; background: #050505; border-color: #1f2937; }
.dark .campus-shortcuts button { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.dark .campus-pills span { color: #ffffff; background: #0a0a0a; border-color: #2563eb; }
.dark .file-room-card { color: #ffffff; background: linear-gradient(135deg, #0a0a0a, #050505); border-color: #1f2937; box-shadow: 0 18px 46px rgba(0,0,0,0.45); }
.dark .file-room-card:hover { border-color: #60a5fa; box-shadow: 0 24px 60px rgba(37,99,235,0.18); }
.dark .file-room-card span:not(.file-room-kicker) { color: #ffffff; background: #0a0a0a; border: 1px solid #1f2937; }
.dark .file-room-card small { color: #ffffff; }
.dark .file-room-kicker, .dark .file-room-card em, .dark .resource-empty svg { color: #7dd3fc; }
.dark .course-card > span:not(.section-label), .dark .material-type-card span { color: #ffffff; background: #0a0a0a; border: 1px solid #1f2937; }
.dark .course-card small, .dark .course-card em, .dark .material-type-card small, .dark .material-type-card em { color: #ffffff; }
.dark .material-type-card.active { color: #ffffff; background: #050505; border-color: #60a5fa; }
.dark .material-type-card.active span { color: #ffffff; background: #0a0a0a; border: 1px solid #1f2937; }
.dark .material-type-card.active small, .dark .material-type-card.active em { color: #ffffff; }
.dark .material-file-item { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.dark .material-file-item:hover { background: #101010; border-color: #60a5fa; }
.dark .material-file-item small { color: #ffffff; }
.dark .resource-preview-stats span { color: #ffffff; background: #0a0a0a; border: 1px solid #1f2937; }
.toast { display: inline-flex; align-items: center; gap: 9px; margin: 0 0 22px; padding: 11px 14px; border-radius: 999px; border: 1px solid #60a5fa; color: #ffffff; background: #1e3a8a; font-weight: 760; animation: fadeUp 0.5s ease both; box-shadow: 0 16px 36px rgba(37,99,235,0.18); }
.toast-mark { display: inline-grid; place-items: center; width: 28px; height: 28px; flex: 0 0 auto; border-radius: 999px; color: #ffffff; background: #2563eb; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18); }
.dark .toast { color: #ffffff; background: #050505; border-color: #2563eb; box-shadow: 0 18px 46px rgba(0,0,0,0.55); }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(340px, 0.72fr); align-items: center; gap: 48px; padding: 52px 0 48px; }
.eyebrow { display: inline-flex; align-items: center; gap: 9px; width: fit-content; margin-bottom: 22px; padding: 9px 13px; border: 1px solid #60a5fa; border-radius: 999px; color: #ffffff; background: #2563eb; font-size: 0.85rem; font-weight: 900; animation: fadeUp 0.75s ease both; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; animation: pulse 1.8s infinite; }
.hero-copy h1 { max-width: 780px; font-size: clamp(3rem, 6vw, 6.2rem); line-height: 0.9; letter-spacing: -0.09em; margin: 0 0 24px; animation: fadeUp 0.8s ease 0.06s both; }
.hero-copy h1 span, .hero-copy h1 strong { color: transparent; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 48%, #06b6d4 100%); -webkit-background-clip: text; background-clip: text; }
.hero-copy p { max-width: 680px; color: #475569; font-size: 1.12rem; line-height: 1.82; margin: 0 0 30px; animation: fadeUp 0.8s ease 0.12s both; }
.hero-actions, .trust-row, .button-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.hero-actions { margin-bottom: 28px; animation: fadeUp 0.8s ease 0.18s both; }
.trust-row span { display: inline-flex; padding: 9px 12px; border-radius: 999px; background: rgba(255,255,255,0.76); border: 1px solid #e2e8f0; color: #64748b; font-weight: 760; }
.campus-pills { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 16px; animation: fadeUp 0.8s ease 0.28s both; }
.campus-pills span { display: inline-flex; padding: 8px 11px; border-radius: 999px; color: #1d4ed8; background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.18); font-size: 0.86rem; font-weight: 850; }
.visual-stage { position: relative; min-height: 590px; animation: fadeScale 0.9s ease 0.16s both; }
.visual-stage.compact-visual { min-height: 420px; display: grid; align-items: center; }
.floating-note { position: absolute; z-index: 4; width: 220px; padding: 15px; border-radius: 24px; background: rgba(255,255,255,0.82); border: 1px solid #e2e8f0; backdrop-filter: blur(18px); box-shadow: 0 24px 60px rgba(15,23,42,0.14); animation: floatCard 5.5s ease-in-out infinite; }
.floating-note.left { left: -4px; top: 110px; }
.floating-note.right { right: -8px; bottom: 118px; animation-delay: -1.6s; }
.floating-note strong, .floating-note span { display: block; }
.floating-note span { color: #64748b; font-size: 0.78rem; line-height: 1.5; margin-top: 5px; }
.isi-info-card { position: relative; overflow: hidden; display: grid; gap: 18px; padding: 14px; border: 1px solid rgba(226,232,240,0.95); background: #ffffff; border-radius: 32px; box-shadow: 0 24px 70px rgba(15,23,42,0.1); }
.isi-photo { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 22px; background: #e2e8f0; }
.isi-info-body { padding: 2px 8px 12px; }
.isi-info-body h2 { margin: 8px 0 10px; font-size: clamp(1.45rem, 2.4vw, 2rem); line-height: 1.08; }
.isi-info-body p { margin: 0 0 16px; }
.isi-facts { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.isi-facts span { padding: 7px 10px; border-radius: 999px; background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; font-size: 0.8rem; font-weight: 820; }
.official-link { display: inline-flex; align-items: center; min-height: 38px; padding: 0 14px; border-radius: 999px; color: #1d4ed8; background: #eff6ff; text-decoration: none; font-weight: 900; }
.dark .trust-row span, .dark .isi-facts span { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.dark .official-link { color: #7dd3fc; background: rgba(125,211,252,0.12); }
.phone-shell { position: relative; z-index: 2; width: min(430px, 100%); margin: 0 auto; padding: 14px; border-radius: 46px; background: rgba(15, 23, 42, 0.94); box-shadow: 0 42px 100px rgba(15, 23, 42, 0.25); }
.phone-screen { min-height: 560px; overflow: hidden; border-radius: 34px; background: linear-gradient(180deg, #f8fafc, #eef2ff); border: 1px solid rgba(255,255,255,0.12); padding: 18px; }
.phone-top, .card-row, .profile-line { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.avatar-group { display: flex; }
.avatar-group span, .avatar { display: grid; place-items: center; width: 34px; height: 34px; margin-left: -8px; border-radius: 999px; color: white; font-weight: 900; background: linear-gradient(135deg, #2563eb, #06b6d4); border: 2px solid #f8fafc; }
.avatar.large { width: 60px; height: 60px; margin-left: 0; font-size: 1.15rem; }
.search-card, .search-field, .select-box { display: flex; align-items: center; gap: 10px; padding: 0 14px; min-height: 52px; border: 1px solid #e2e8f0; border-radius: 20px; background: rgba(255,255,255,0.86); color: #64748b; font-weight: 700; box-shadow: 0 12px 28px rgba(15,23,42,0.05); }
.search-card { margin: 16px 0; }
.mini-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
.mini-tabs button { border: 0; padding: 10px; border-radius: 16px; color: #64748b; background: rgba(255,255,255,0.55); font-weight: 850; transition: 0.24s ease; }
.mini-tabs button.active { color: white; background: linear-gradient(135deg, #2563eb, #06b6d4); box-shadow: 0 14px 26px rgba(37,99,235,0.25); }
.phone-feed-card { padding: 16px; margin-bottom: 11px; border-radius: 22px; background: rgba(255,255,255,0.86); border: 1px solid rgba(226,232,240,0.9); box-shadow: 0 12px 30px rgba(15,23,42,0.055); animation: slideSoft 4.5s ease-in-out infinite; }
.phone-feed-card span { display: block; color: #64748b; margin-top: 6px; font-size: 0.82rem; font-weight: 650; }
.phone-feed-card:nth-child(2) { animation-delay: -0.8s; }
.mobile-nav { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 17px; padding: 9px; border-radius: 24px; background: rgba(255,255,255,0.86); border: 1px solid #e2e8f0; }
.mobile-nav span { text-align: center; color: #64748b; font-size: 0.72rem; font-weight: 850; padding: 8px 4px; border-radius: 16px; }
.stat-grid, .card-grid, .quick-grid, .filter-bar { display: grid; gap: 16px; }
.stat-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 24px; }
.card-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.card-grid.essentials { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 18px; }
.card-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.card-grid.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.stat-card, .glass-card, .glass-panel, .feature-card, .question-card, .post-composer, .post-card, .bot-panel, .bot-side, .professor-list-panel, .professor-hero, .professor-upload, .course-material-card, .classroom-about, .course-empty, .club-card, .event-card, .message-panel, .history-panel, .admin-card, .result-card, .empty-state, .page-header, .guide-card { border: 1px solid rgba(226,232,240,0.95); background: rgba(255,255,255,0.74); backdrop-filter: blur(16px); border-radius: 32px; box-shadow: 0 18px 50px rgba(15,23,42,0.055); transition: 0.28s ease; }
.stat-card { padding: 20px; display: grid; gap: 8px; }
.stat-card svg, .feature-card svg, .event-icon, .guide-card > svg { width: 52px; height: 52px; padding: 14px; border-radius: 20px; color: #1d4ed8; background: #eff6ff; }
.stat-card strong { font-size: 2rem; letter-spacing: -0.05em; }
.feature-card, .guide-card { align-items: flex-start; flex-direction: column; text-align: left; color: inherit; padding: 24px; position: relative; overflow: hidden; }
.feature-card::after, .glass-card::after { content: ""; position: absolute; right: -80px; bottom: -80px; width: 180px; height: 180px; background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(6,182,212,0.11)); transform: rotate(18deg); border-radius: 36px; }
.feature-card h3, .feature-card p, .feature-card span, .glass-card > *, .guide-card > * { position: relative; z-index: 1; }
.feature-card span, .guide-card span { display: inline-flex; align-items: center; gap: 6px; color: #1d4ed8; font-weight: 900; }
.campus-shortcuts { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr); gap: 18px; align-items: center; padding: 18px 20px; margin: 18px 0 20px; border: 1px solid rgba(226,232,240,0.95); background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); border-radius: 28px; box-shadow: 0 18px 50px rgba(15,23,42,0.045); }
.campus-shortcuts h2 { margin: 5px 0 0; font-size: clamp(1.25rem, 2vw, 1.75rem); }
.campus-shortcuts > div:last-child { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.campus-shortcuts button { border: 1px solid #e2e8f0; background: rgba(255,255,255,0.86); color: #0f172a; min-height: 42px; padding: 0 14px; border-radius: 999px; display: inline-flex; align-items: center; gap: 8px; font-weight: 880; }
p, li { color: #64748b; line-height: 1.65; }
h1, h2, h3 { letter-spacing: -0.055em; }
.page-shell { display: grid; gap: 22px; animation: fadeUp 0.45s ease both; }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 30px; }
.page-header h1 { margin: 6px 0 0; max-width: 800px; font-size: clamp(2rem, 4vw, 3.6rem); line-height: 1.02; }
.section-label { color: #2563eb; font-size: 0.78rem; font-weight: 950; letter-spacing: 0.09em; text-transform: uppercase; }
.section-label.small { font-size: 0.72rem; }
.filter-bar { grid-template-columns: minmax(240px, 1fr) repeat(3, minmax(150px, 180px)); }
.room-filter-bar { grid-template-columns: minmax(240px, 1fr) repeat(2, minmax(150px, 190px)); }
.wide { min-width: 0; }
.glass-card, .glass-panel, .club-card, .admin-card { padding: 24px; position: relative; overflow: hidden; }
.file-room-picker, .resource-room, .course-browser { display: grid; gap: 18px; }
.file-program-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.file-program-panel, .resource-room-head, .resource-empty { padding: 24px; border: 1px solid rgba(226,232,240,0.95); background: rgba(255,255,255,0.74); backdrop-filter: blur(16px); border-radius: 32px; box-shadow: 0 18px 50px rgba(15,23,42,0.055); transition: 0.28s ease; }
.file-program-panel h3, .resource-room-head h2 { margin: 6px 0 0; }
.file-program-panel p, .resource-room-head p, .resource-helper { margin: 12px 0 0; }
.file-year-grid { display: grid; gap: 12px; margin-top: 18px; }
.file-room-card { position: relative; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 12px; min-height: 132px; padding: 18px; text-align: left; border: 1px solid #dbeafe; border-radius: 24px; color: #0f172a; background: linear-gradient(135deg, rgba(239,246,255,0.92), rgba(255,255,255,0.9)); box-shadow: 0 14px 34px rgba(15,23,42,0.045); transition: transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease; }
.file-room-card::after { content: ""; position: absolute; right: -48px; bottom: -56px; width: 136px; height: 136px; border-radius: 36px; background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(6,182,212,0.14)); transform: rotate(18deg); }
.file-room-card:hover { transform: translateY(-5px); border-color: #60a5fa; box-shadow: 0 22px 56px rgba(37,99,235,0.13); }
.file-room-card > * { position: relative; z-index: 1; }
.file-room-card strong { font-size: 1.25rem; letter-spacing: -0.04em; }
.file-room-card span:not(.file-room-kicker) { align-self: start; justify-self: end; padding: 7px 10px; border-radius: 999px; color: #075985; background: #e0f2fe; font-size: 0.82rem; font-weight: 950; }
.file-room-kicker { color: #2563eb; font-size: 0.78rem; font-weight: 950; letter-spacing: 0.09em; }
.file-room-card small { color: #64748b; font-weight: 900; }
.file-room-card em { align-self: end; color: #1d4ed8; font-style: normal; font-weight: 950; }
.resource-room-head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 16px; align-items: center; }
.resource-empty { min-height: 280px; display: grid; place-items: center; text-align: center; align-content: center; }
.resource-empty svg { width: 54px; height: 54px; padding: 14px; border-radius: 20px; color: #1d4ed8; background: #eff6ff; }
.course-card-grid, .material-type-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.course-card, .material-type-card, .course-browser-head { position: relative; overflow: hidden; padding: 20px; border: 1px solid rgba(226,232,240,0.95); border-radius: 26px; color: #0f172a; background: rgba(255,255,255,0.78); box-shadow: 0 18px 50px rgba(15,23,42,0.055); transition: transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease, background 0.24s ease; }
.course-card, .material-type-card { display: grid; gap: 8px; min-height: 190px; text-align: left; }
.course-card::after, .material-type-card::after { content: ""; position: absolute; right: -60px; bottom: -62px; width: 150px; height: 150px; border-radius: 36px; background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(6,182,212,0.13)); transform: rotate(18deg); }
.course-card:hover, .material-type-card:hover { transform: translateY(-5px); border-color: #60a5fa; box-shadow: 0 24px 60px rgba(37,99,235,0.13); }
.course-card > *, .material-type-card > * { position: relative; z-index: 1; }
.course-card strong, .material-type-card strong { font-size: 1.22rem; letter-spacing: -0.04em; }
.course-card p { margin: 0; }
.course-card > span:not(.section-label), .material-type-card span { width: fit-content; padding: 7px 10px; border-radius: 999px; color: #075985; background: #e0f2fe; font-size: 0.82rem; font-weight: 950; }
.course-card small, .material-type-card small { display: inline-flex; align-items: center; gap: 6px; color: #64748b; font-weight: 900; }
.course-card em, .material-type-card em { align-self: end; color: #1d4ed8; font-style: normal; font-weight: 950; }
.material-type-card.active { color: #0f172a; background: rgba(255,255,255,0.78); border-color: #60a5fa; box-shadow: 0 24px 60px rgba(37,99,235,0.13); }
.material-type-card.active span { color: #075985; background: #e0f2fe; }
.material-type-card.active small { color: #64748b; }
.material-type-card.active em { color: #1d4ed8; }
.material-bucket-card { align-content: start; min-height: 178px; cursor: pointer; }
.material-bucket-card.expanded { min-height: 260px; }
.material-bucket-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.material-bucket-head > div { display: grid; gap: 7px; }
.material-bucket-head span { width: fit-content; padding: 7px 10px; border-radius: 999px; color: #075985; background: #e0f2fe; font-size: 0.82rem; font-weight: 950; white-space: nowrap; }
.material-file-list { display: grid; gap: 9px; margin-top: 8px; }
.material-card-hint { align-self: end; width: fit-content; color: #1d4ed8; font-style: normal; font-weight: 950; }
.material-file-item { display: grid; grid-template-columns: minmax(0, 1fr) auto auto auto; gap: 10px; align-items: center; width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 18px; color: inherit; background: rgba(248,250,252,0.86); text-align: left; transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease; }
.material-file-item:hover { transform: translateX(5px); border-color: #60a5fa; background: #ffffff; }
.material-file-item h3, .material-file-item p { margin: 0; }
.material-file-item h3 { font-size: 0.98rem; letter-spacing: -0.035em; }
.material-file-item p { font-size: 0.84rem; }
.material-file-item small { display: inline-flex; align-items: center; gap: 5px; color: #64748b; font-weight: 900; white-space: nowrap; }
.material-file-item .status { font-style: normal; }
.course-browser-head { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px; align-items: center; }
.course-browser-head h2, .course-browser-head p { margin: 0; }
.resource-file-card { cursor: pointer; outline: 0; }
.resource-file-card:focus-visible { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37,99,235,0.18), 0 24px 60px rgba(37,99,235,0.12); }
.resource-preview-card, .resource-upload-card { width: min(720px, 100%); }
.resource-preview-card { gap: 16px; }
.resource-preview-stats { display: flex; flex-wrap: wrap; gap: 9px; }
.resource-preview-stats span { display: inline-flex; align-items: center; gap: 7px; min-height: 36px; padding: 0 11px; border-radius: 999px; color: #075985; background: #e0f2fe; font-weight: 900; }
.status { display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 900; background: #e0f2fe; color: #075985; }
.status.approved { background: #dcfce7; color: #166534; }
.status.pending { background: #fef3c7; color: #92400e; }
.status.flagged, .result-card.danger { background: #ffe4e6; color: #9f1239; }
.rating { display: inline-flex; align-items: center; gap: 5px; color: #d97706; font-weight: 900; }
.tag-row { display: flex; flex-wrap: wrap; gap: 7px; margin: 14px 0; }
.tag-row span { padding: 6px 10px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; font-size: 0.82rem; font-weight: 850; }
.dark .tag-row span { color: #ffffff; background: #0a0a0a; border: 1px solid #1f2937; }
.button-row { margin-top: 16px; }
.no-margin { margin-top: 0; }
.warning-band { display: flex; align-items: center; gap: 9px; padding: 14px 16px; border-radius: 22px; background: #fff7ed; color: #9a3412; border: 1px solid #fed7aa; font-weight: 760; }
.stack { display: grid; gap: 14px; }
.compact-stack { gap: 10px; }
.question-card { display: grid; grid-template-columns: 84px minmax(0, 1fr) 110px; gap: 16px; align-items: center; padding: 18px; }
.vote-box, .answer-box { display: grid; place-items: center; gap: 4px; padding: 12px; border-radius: 22px; background: #eff6ff; color: #1d4ed8; font-weight: 850; }
.answer-box .btn { margin-top: 8px; min-height: 36px; padding: 0 12px; }
.community-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.community-summary span { display: grid; gap: 4px; padding: 15px; border-radius: 24px; border: 1px solid #e2e8f0; background: rgba(255,255,255,0.72); box-shadow: 0 14px 34px rgba(15,23,42,0.045); color: #64748b; font-weight: 820; }
.community-summary strong { color: #1d4ed8; font-size: 1.65rem; letter-spacing: -0.05em; }
.posts-layout { display: grid; grid-template-columns: minmax(300px, 0.42fr) minmax(0, 1fr); gap: 20px; align-items: start; }
.community-layout { grid-template-columns: minmax(310px, 0.38fr) minmax(0, 1fr); }
.post-composer { position: sticky; top: 110px; padding: 24px; }
.post-composer h2 { margin: 6px 0 8px; font-size: clamp(1.5rem, 2.4vw, 2.1rem); }
.post-composer p { margin: 0; }
.post-composer textarea { width: 100%; min-height: 170px; margin-top: 16px; resize: vertical; }
.locked-composer { min-height: 360px; display: grid; place-items: start; align-content: center; gap: 12px; }
.locked-composer svg { width: 52px; height: 52px; padding: 14px; border-radius: 20px; color: #1d4ed8; background: #eff6ff; }
.post-type-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.post-type-row button { min-height: 36px; border: 1px solid #e2e8f0; border-radius: 999px; padding: 0 11px; color: #475569; background: #f8fafc; font-weight: 850; }
.post-type-row button.selected { color: #fff; background: linear-gradient(135deg, #2563eb, #06b6d4); border-color: transparent; }
.post-photo-input { display: flex; align-items: center; gap: 9px; margin-top: 12px; min-height: 46px; padding: 0 10px 0 12px; border: 1px solid #e2e8f0; border-radius: 18px; background: rgba(255,255,255,0.82); color: #64748b; }
.post-photo-input input { min-width: 0; border: 0; outline: 0; background: transparent; color: inherit; flex: 1; }
.post-photo-input button { border: 0; border-radius: 999px; min-height: 32px; padding: 0 10px; color: #1d4ed8; background: #eff6ff; font-weight: 900; white-space: nowrap; }
.post-photo-preview, .post-photo { width: 100%; object-fit: cover; border-radius: 22px; border: 1px solid #e2e8f0; background: #e2e8f0; }
.post-photo-preview { aspect-ratio: 16 / 9; margin-top: 12px; }
.composer-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; color: #64748b; font-weight: 800; }
.post-feed { display: grid; gap: 14px; }
.community-feed { gap: 18px; }
.post-card { padding: 22px; }
.community-post { display: grid; gap: 14px; }
.post-meta { display: flex; align-items: center; gap: 12px; }
.post-meta .avatar { margin-left: 0; }
.post-meta .status { margin-left: auto; }
.post-meta small { display: block; margin-top: 3px; color: #64748b; }
.post-card p { margin: 0; font-size: 1rem; }
.post-photo { max-height: 390px; aspect-ratio: 16 / 9; }
.post-stats { display: flex; flex-wrap: wrap; gap: 8px; color: #64748b; font-size: 0.86rem; font-weight: 850; }
.post-stats span { padding: 6px 9px; border-radius: 999px; background: #f8fafc; border: 1px solid #e2e8f0; }
.post-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.post-actions button { display: inline-flex; align-items: center; gap: 7px; min-height: 38px; border: 1px solid #e2e8f0; border-radius: 999px; padding: 0 12px; background: #f8fafc; color: #475569; font-weight: 850; }
.post-actions button.active { color: #1d4ed8; background: #eff6ff; border-color: #bfdbfe; }
.comment-thread { display: grid; gap: 10px; padding-top: 2px; }
.comment-row { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: start; }
.comment-row .avatar { margin-left: 0; width: 30px; height: 30px; font-size: 0.78rem; }
.comment-row div { padding: 10px 12px; border-radius: 18px; background: #f8fafc; border: 1px solid #e2e8f0; }
.comment-row strong, .comment-row small { display: block; }
.comment-row p { margin: 4px 0; font-size: 0.92rem; }
.comment-composer { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; }
.comment-composer input { min-width: 0; min-height: 42px; border: 1px solid #e2e8f0; border-radius: 999px; padding: 0 14px; background: rgba(255,255,255,0.86); color: inherit; outline: 0; }
.comment-composer .btn { min-height: 42px; }
.dark .community-summary span, .dark .post-type-row button, .dark .post-photo-input, .dark .post-stats span, .dark .comment-row div, .dark .comment-composer input { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.dark .locked-composer svg { color: #7dd3fc; background: rgba(125,211,252,0.12); }
.dark .post-type-row button.selected { color: #fff; background: linear-gradient(135deg, #2563eb, #06b6d4); }
.dark .post-actions button { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.dark .post-actions button.active { color: #ffffff; background: #1d4ed8; border-color: #60a5fa; }
.professor-layout { display: grid; grid-template-columns: minmax(280px, 0.36fr) minmax(0, 1fr); gap: 20px; align-items: start; }
.professor-list-panel { position: sticky; top: 110px; padding: 22px; }
.compact-title h2 { margin: 5px 0 0; }
.professor-note { margin: 12px 0 0; font-size: 0.92rem; }
.professor-list { display: grid; gap: 10px; margin-top: 16px; }
.professor-card { width: 100%; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px; align-items: center; text-align: left; padding: 13px; border: 1px solid #e2e8f0; border-radius: 22px; color: inherit; background: rgba(248,250,252,0.86); }
.professor-card .avatar { margin-left: 0; }
.professor-card strong, .professor-card small, .professor-card em { display: block; }
.professor-card small { margin-top: 4px; color: #64748b; }
.professor-card em { width: fit-content; margin-top: 8px; padding: 5px 8px; border-radius: 999px; color: #075985; background: #e0f2fe; font-style: normal; font-size: 0.76rem; font-weight: 900; }
.professor-card.selected { border-color: #60a5fa; background: #eff6ff; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
.professor-detail-panel { display: grid; gap: 16px; }
.professor-hero, .professor-upload, .course-material-card { padding: 24px; }
.classroom-empty { min-height: 420px; display: grid; place-items: center; align-content: center; gap: 12px; text-align: center; padding: 34px; }
.classroom-empty svg, .course-empty svg { width: 58px; height: 58px; color: #1d4ed8; }
.professor-hero .profile-line { align-items: flex-start; }
.professor-hero h2 { margin: 5px 0 8px; font-size: clamp(1.7rem, 3vw, 2.45rem); }
.professor-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 18px; }
.professor-stats span { display: grid; gap: 3px; padding: 13px; border-radius: 20px; background: #eff6ff; color: #1d4ed8; font-weight: 850; }
.professor-stats strong { font-size: 1.45rem; letter-spacing: -0.05em; }
.professor-upload { display: grid; gap: 14px; }
.professor-upload h3 { margin: 5px 0 8px; font-size: 1.45rem; }
.professor-upload p { margin: 0; }
.professor-upload-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.professor-upload label { display: grid; gap: 7px; color: #64748b; font-weight: 850; }
.professor-upload input, .professor-upload select, .professor-upload textarea { width: 100%; min-height: 42px; border: 1px solid #e2e8f0; border-radius: 16px; padding: 0 12px; color: inherit; background: rgba(255,255,255,0.86); outline: 0; }
.professor-upload textarea { min-height: 110px; padding: 12px; resize: vertical; }
.upload-title { margin-top: 2px; }
.classroom-stream { display: grid; grid-template-columns: minmax(0, 1fr) minmax(260px, 0.34fr); gap: 16px; align-items: start; }
.classroom-main { display: grid; gap: 14px; min-width: 0; }
.classroom-toolbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.classroom-about, .course-empty { padding: 22px; }
.classroom-about h3, .course-empty h3 { margin: 8px 0; }
.course-empty { display: grid; place-items: start; gap: 8px; min-height: 230px; }
.course-materials { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.classroom-materials { grid-template-columns: 1fr; }
.course-material-card h3 { margin: 14px 0 8px; }
.course-material-card .btn { margin-top: 8px; }
.dark .professor-card { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.dark .professor-card.selected { background: rgba(125,211,252,0.12); border-color: rgba(125,211,252,0.35); }
.dark .professor-card small, .dark .professor-upload label { color: #ffffff; }
.dark .professor-stats span { color: #7dd3fc; background: rgba(125,211,252,0.12); }
.dark .professor-upload input, .dark .professor-upload select, .dark .professor-upload textarea { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.split-layout, .connect-layout, .guide-layout, .calculator-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(340px, 0.82fr); gap: 20px; align-items: start; }
.connect-layout.single { grid-template-columns: 1fr; }
.messages-layout { display: grid; grid-template-columns: minmax(260px, 0.34fr) minmax(0, 1fr); gap: 20px; align-items: start; }
.dark-panel { color: #fff; padding: 28px; border-radius: 36px; background: linear-gradient(135deg, #0f172a, #1e293b); box-shadow: 0 32px 90px rgba(15,23,42,0.22); }
.dark .dark-panel { background: #050505; border: 1px solid #1f2937; box-shadow: 0 32px 90px rgba(0,0,0,0.65); }
.dark-panel p, .dark-panel li, .dark-panel span { color: #ffffff; }
.sticky-panel, .guide-detail { position: sticky; top: 110px; }
.mini-card { padding: 16px; border-radius: 20px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); }
.mini-card span { display: block; margin-top: 6px; line-height: 1.55; }
.student-list { display: grid; gap: 10px; margin-top: 14px; }
.student-card { width: 100%; display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; gap: 12px; align-items: start; text-align: left; padding: 16px; border: 1px solid rgba(125,211,252,0.45); background: radial-gradient(circle at 12% 0%, rgba(6,182,212,0.24), transparent 32%), linear-gradient(135deg, #1d4ed8, #0e7490); border-radius: 22px; color: #ffffff; box-shadow: 0 18px 54px rgba(37,99,235,0.22); transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background 0.24s ease; }
.student-card:hover { transform: translateY(-5px); border-color: #bfdbfe; box-shadow: 0 26px 66px rgba(37,99,235,0.28); }
.student-card.selected { border-color: #ffffff; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.24), 0 24px 66px rgba(37,99,235,0.3); }
.student-card small { display: block; color: #e0f2fe; margin-top: 4px; }
.points { padding: 6px 9px; border-radius: 999px; background: #dcfce7; color: #166534; font-style: normal; font-size: 0.78rem; font-weight: 900; }
.presence { display: inline-flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; min-height: 30px; padding: 6px 10px; border-radius: 999px; border: 1px solid transparent; font-size: 0.78rem; font-weight: 950; line-height: 1; white-space: nowrap; }
.presence::before { content: ""; width: 7px; height: 7px; border-radius: 999px; background: currentColor; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 15%, transparent); }
.presence.online { color: #047857; }
.presence.online { background: #d1fae5; border-color: #a7f3d0; }
.presence.studying { color: #1d4ed8; }
.presence.studying { background: #dbeafe; border-color: #bfdbfe; }
.presence.away { color: #92400e; }
.presence.away { background: #fef3c7; border-color: #fde68a; }
.presence.offline { color: #475569; }
.presence.offline { background: #e2e8f0; border-color: #cbd5e1; }
.presence.compact { min-height: 24px; margin-top: 7px; padding: 5px 8px; font-size: 0.72rem; }
.student-card .btn { min-height: 38px; padding: 0 13px; align-self: center; }
.student-card .avatar { background: linear-gradient(135deg, #7c3aed, #06b6d4); box-shadow: 0 12px 28px rgba(124,58,237,0.2); }
.student-card:nth-child(3n+2) .avatar { background: linear-gradient(135deg, #059669, #06b6d4); }
.student-card:nth-child(3n+3) .avatar { background: linear-gradient(135deg, #2563eb, #f97316); }
.student-card .tag-row span { color: #ffffff; background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.22); }
.history-item .presence, .message-panel.solo .presence { color: #ffffff; background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.22); }
.student-card .btn-primary { color: #1d4ed8; background: #ffffff; box-shadow: none; }
.empty-mini { min-height: 210px; display: grid; place-items: center; align-content: center; gap: 8px; border: 1px dashed #93c5fd; border-radius: 24px; color: #1d4ed8; background: rgba(239,246,255,0.7); text-align: center; }
.empty-mini svg { width: 44px; height: 44px; padding: 10px; border-radius: 18px; color: #ffffff; background: linear-gradient(135deg, #2563eb, #06b6d4); }
.empty-mini span { color: #475569; }
.message-panel, .history-panel { padding: 24px; }
.message-panel.solo { min-height: 560px; color: #ffffff; background: radial-gradient(circle at 10% 0%, rgba(6,182,212,0.26), transparent 32%), linear-gradient(135deg, #1e3a8a, #075985 58%, #0f172a); border-color: rgba(125,211,252,0.42); box-shadow: 0 30px 90px rgba(30,58,138,0.28); }
.message-panel.solo h2, .message-panel.solo p, .message-panel.solo small, .message-panel.solo .tag-row span { color: #ffffff; }
.message-panel.solo .tag-row span { background: rgba(255,255,255,0.13); border-color: rgba(255,255,255,0.2); }
.history-panel { position: sticky; top: 110px; }
.history-list { display: grid; gap: 10px; margin-top: 16px; }
.history-panel { color: #ffffff; background: linear-gradient(180deg, #1d4ed8, #0e7490); border-color: rgba(125,211,252,0.45); box-shadow: 0 28px 80px rgba(30,64,175,0.26); }
.history-panel .section-label, .history-panel h2 { color: #ffffff; }
.history-item { width: 100%; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px; align-items: center; text-align: left; padding: 13px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.12); color: #ffffff; transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease; }
.history-item:hover { transform: translateX(6px); background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.36); }
.history-item.selected { border-color: #7dd3fc; background: rgba(125,211,252,0.22); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12), 0 16px 34px rgba(14,116,144,0.24); }
.history-item .avatar { background: linear-gradient(135deg, #f97316, #facc15); color: #0f172a; border-color: rgba(255,255,255,0.52); transition: transform 0.22s ease; }
.history-item:hover .avatar { transform: scale(1.08) rotate(-3deg); }
.history-item small { display: block; margin-top: 4px; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.9; }
.chat-toolbar { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 18px; }
.chat-toolbar span { display: inline-flex; align-items: center; gap: 8px; color: #e0f2fe; font-weight: 900; }
.chat-toolbar svg { color: #7dd3fc; }
.chat-profile-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
.chat-box { display: grid; gap: 10px; padding: 16px; border-radius: 24px; background: rgba(255,255,255,0.11); border: 1px solid rgba(255,255,255,0.18); margin-top: 18px; }
.chat-box.tall { min-height: 280px; align-content: start; }
.chat-note { display: flex; align-items: center; gap: 8px; color: #ffffff; font-size: 0.86rem; font-weight: 760; opacity: 0.92; }
.chat-bubble { justify-self: end; max-width: 85%; border-radius: 18px 18px 6px 18px; background: linear-gradient(135deg, #2563eb, #06b6d4); color: #fff; padding: 11px 13px; box-shadow: 0 14px 28px rgba(8,47,73,0.24); animation: fadeUp 0.28s ease both; }
.composer { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; margin-top: 12px; }
.composer input { border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.92); border-radius: 999px; padding: 0 15px; color: #0f172a; }
.profile-card-main { color: #ffffff; background: radial-gradient(circle at 12% 0%, rgba(6,182,212,0.22), transparent 30%), linear-gradient(135deg, #1e3a8a, #0e7490); border-color: rgba(125,211,252,0.38); }
.profile-card-main h2, .profile-card-main p, .profile-card-main .tag-row span { color: #ffffff; }
.profile-card-main .tag-row span { background: rgba(255,255,255,0.13); border-color: rgba(255,255,255,0.22); }
.profile-card-main .avatar.large { background: linear-gradient(135deg, #06b6d4, #7c3aed); border-color: rgba(255,255,255,0.38); }
.status-switcher { display: grid; gap: 12px; margin-top: 18px; padding: 15px; border-radius: 22px; background: rgba(255,255,255,0.11); border: 1px solid rgba(255,255,255,0.18); }
.status-switcher > div:first-child { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.status-switcher strong { color: #ffffff; }
.points-panel { display: grid; gap: 7px; margin-top: 14px; padding: 16px; border-radius: 24px; color: #ffffff; background: rgba(255,255,255,0.13); border: 1px solid rgba(255,255,255,0.2); }
.points-panel strong { font-size: clamp(2.6rem, 5vw, 4rem); line-height: 0.95; letter-spacing: -0.07em; }
.points-panel p { margin: 0; font-weight: 900; }
.points-progress { height: 10px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,0.18); }
.points-progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ffffff, #7dd3fc); transition: width 0.28s ease; }
.profile-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.danger-action { color: #1d4ed8; }
.profile-badges { background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(239,246,255,0.82)); }
.profile-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 16px 0; }
.profile-stats span { display: grid; gap: 4px; padding: 12px; border-radius: 18px; color: #1d4ed8; background: #eff6ff; font-weight: 850; }
.profile-stats strong { font-size: 1.5rem; letter-spacing: -0.05em; }
.points-ledger { display: grid; gap: 10px; margin: 16px 0; }
.points-ledger h3 { margin: 0; }
.ledger-row { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: center; padding: 10px; border: 1px solid #e2e8f0; border-radius: 18px; background: #f8fafc; }
.ledger-row small { display: block; margin-top: 3px; color: #64748b; }
.ledger-score { display: inline-grid; place-items: center; min-width: 44px; min-height: 34px; border-radius: 999px; font-weight: 950; }
.ledger-score.positive { color: #166534; background: #dcfce7; }
.ledger-score.negative { color: #9f1239; background: #ffe4e6; }
.point-rule-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 16px; }
.point-rule-grid span { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 16px; color: #075985; background: #e0f2fe; font-weight: 850; }
.point-rule-grid strong { color: #1d4ed8; }
.dark .student-card { color: #ffffff; background: radial-gradient(circle at 12% 0%, rgba(6,182,212,0.18), transparent 32%), linear-gradient(135deg, #1d4ed8, #0e7490); border-color: rgba(125,211,252,0.45); box-shadow: 0 18px 54px rgba(0,0,0,0.5); }
.dark .student-card:hover { border-color: #bfdbfe; box-shadow: 0 24px 60px rgba(37,99,235,0.24); }
.dark .student-card.selected { border-color: #ffffff; }
.dark .presence.offline { color: #ffffff; background: #27272a; border-color: #3f3f46; }
.dark .presence.online { background: rgba(5,150,105,0.22); border-color: rgba(16,185,129,0.36); }
.dark .presence.studying { background: rgba(37,99,235,0.24); border-color: rgba(96,165,250,0.42); }
.dark .presence.away { background: rgba(245,158,11,0.2); border-color: rgba(251,191,36,0.36); }
.dark .empty-mini { color: #ffffff; background: #050505; border-color: #1f2937; }
.dark .empty-mini span { color: #ffffff; }
.dark .profile-badges { color: #ffffff; background: #050505; border-color: #1f2937; }
.dark .profile-stats span, .dark .ledger-row, .dark .point-rule-grid span { color: #ffffff; background: #0a0a0a; border: 1px solid #1f2937; }
.dark .ledger-row small, .dark .point-rule-grid strong { color: #ffffff; }
.bot-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(270px, 0.34fr); gap: 20px; align-items: start; }
.bot-panel, .bot-side { padding: 24px; }
.bot-panel { background: radial-gradient(circle at 12% 0%, rgba(6,182,212,0.14), transparent 28%), rgba(255,255,255,0.78); }
.bot-hero { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px; align-items: start; }
.bot-mark { width: 58px; height: 58px; display: grid; place-items: center; border-radius: 22px; color: #fff; background: linear-gradient(135deg, #2563eb, #06b6d4); box-shadow: 0 18px 38px rgba(37,99,235,0.25); }
.bot-mark svg { width: 28px; height: 28px; }
.bot-hero h2, .bot-side h3 { margin: 6px 0 8px; }
.bot-chat { display: grid; gap: 12px; min-height: 340px; max-height: 520px; overflow: auto; margin-top: 20px; padding: 14px; border-radius: 26px; background: linear-gradient(180deg, #eff6ff, #ffffff); border: 1px solid #dbeafe; }
.bot-bubble { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: start; max-width: 86%; }
.bot-bubble svg, .bot-bubble .avatar { width: 34px; height: 34px; margin-left: 0; padding: 8px; border-radius: 14px; color: #ffffff; background: linear-gradient(135deg, #7c3aed, #06b6d4); }
.bot-bubble p { margin: 0; padding: 12px 14px; border-radius: 20px; background: #ffffff; border: 1px solid #dbeafe; white-space: pre-line; box-shadow: 0 12px 30px rgba(15,23,42,0.05); }
.bot-user { justify-self: end; grid-template-columns: minmax(0, 1fr) auto; }
.bot-user .avatar { order: 2; }
.bot-user p { color: #fff; background: linear-gradient(135deg, #2563eb, #06b6d4); border-color: transparent; }
.bot-composer { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; margin-top: 14px; }
.bot-composer input { min-width: 0; min-height: 48px; border: 1px solid #e2e8f0; border-radius: 999px; padding: 0 16px; background: rgba(255,255,255,0.9); color: inherit; outline: 0; }
.bot-prompts { display: grid; gap: 10px; margin-top: 14px; }
.bot-prompts button { display: flex; align-items: center; gap: 9px; min-height: 44px; padding: 0 13px; border: 1px solid #e2e8f0; border-radius: 18px; color: #0f172a; background: #f8fafc; font-weight: 850; text-align: left; transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease; }
.bot-prompts button:hover { transform: translateX(5px); border-color: #60a5fa; background: #eff6ff; }
.bot-prompts button svg { color: #7c3aed; }
.bot-help-card { margin-top: 16px; padding: 16px; border-radius: 22px; color: #ffffff; background: linear-gradient(135deg, #1d4ed8, #0e7490); }
.bot-help-card p { margin: 6px 0 0; color: #ffffff; }
.dark .bot-panel { background: radial-gradient(circle at 12% 0%, rgba(37,99,235,0.2), transparent 32%), #050505; }
.dark .bot-chat, .dark .bot-composer input, .dark .bot-prompts button { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.dark .bot-answer p { color: #ffffff; background: #101010; border-color: #1f2937; }
.dark .bot-user p { color: #ffffff; background: #1d4ed8; border-color: #2563eb; }
.event-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 18px; }
.club-card h3, .admin-card h3 { margin-bottom: 8px; }
.guide-card.selected { border-color: #60a5fa; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.form-grid label, .modal-card label { display: grid; gap: 7px; color: #64748b; font-weight: 850; }
.form-grid input, .modal-card input, .modal-card select, textarea { border: 1px solid #e2e8f0; border-radius: 18px; padding: 0 12px; background: rgba(255,255,255,0.82); }
.result-card { padding: 28px; border-top: 5px solid #22c55e; }
.result-card strong { display: block; font-size: clamp(3rem, 6vw, 5rem); line-height: 1; letter-spacing: -0.08em; margin: 10px 0; }
.meter { height: 12px; overflow: hidden; border-radius: 999px; background: #e2e8f0; margin: 18px 0 10px; }
.meter span { display: block; height: 100%; background: linear-gradient(90deg, #22c55e, #f59e0b, #e11d48); }
.badge-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
.badge-grid span { display: flex; align-items: center; gap: 8px; padding: 12px; border-radius: 18px; border: 1px solid #e2e8f0; font-weight: 850; }
.admin-card > span { display: block; font-size: 2.2rem; font-weight: 950; color: #1d4ed8; }
.admin-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.admin-summary span { display: grid; gap: 4px; padding: 18px; border-radius: 24px; color: #ffffff; background: linear-gradient(135deg, #1d4ed8, #0e7490); box-shadow: 0 18px 42px rgba(37,99,235,0.18); font-weight: 850; }
.admin-summary strong { font-size: 1.85rem; letter-spacing: -0.05em; }
.admin-board { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; align-items: start; }
.admin-panel { display: grid; gap: 16px; padding: 24px; border: 1px solid rgba(226,232,240,0.95); background: rgba(255,255,255,0.78); backdrop-filter: blur(16px); border-radius: 32px; box-shadow: 0 18px 50px rgba(15,23,42,0.055); }
.wide-admin-panel { grid-column: 1 / -1; }
.admin-list, .admin-account-list { display: grid; gap: 12px; }
.review-card, .account-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 16px; border: 1px solid #e2e8f0; border-radius: 22px; background: rgba(248,250,252,0.86); }
.review-card p, .review-card small, .account-row small { display: block; margin: 4px 0 0; color: #64748b; }
.review-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.account-row { grid-template-columns: auto minmax(0, 1fr) auto auto auto; }
.account-row .avatar { margin-left: 0; background: linear-gradient(135deg, #7c3aed, #06b6d4); }
.account-row.banned { border-color: #fecdd3; background: #fff1f2; }
.account-row.banned .avatar { background: linear-gradient(135deg, #ef4444, #f97316); }
.dark .admin-summary span { background: linear-gradient(135deg, #1d4ed8, #0e7490); box-shadow: 0 18px 50px rgba(0,0,0,0.5); }
.dark .review-card p, .dark .review-card small, .dark .account-row small { color: #ffffff; }
.dark .account-row.banned { background: #1a0508; border-color: #7f1d1d; }
.empty-state { min-height: 450px; display: grid; place-items: center; text-align: center; padding: 32px; }
.empty-state svg { width: 58px; height: 58px; color: #1d4ed8; }
.modal-backdrop { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 18px; background: rgba(15, 23, 42, 0.56); }
.modal-card { position: relative; display: grid; gap: 14px; width: min(520px, 100%); padding: 26px; border-radius: 30px; border: 1px solid #e2e8f0; background: rgba(255,255,255,0.94); box-shadow: 0 32px 90px rgba(15,23,42,0.22); }
.modal-card h2, .modal-card p { margin: 0; }
.modal-card small { color: #64748b; font-weight: 760; }
.modal-card textarea { min-height: 120px; resize: vertical; padding: 12px; }
.modal-card input[type="file"] { min-height: 46px; padding: 10px 12px; }
.modal-error { padding: 10px 12px; border-radius: 16px; color: #9f1239; background: #ffe4e6; border: 1px solid #fecdd3; font-weight: 800; }
.auth-help { width: fit-content; padding: 0; }
.auth-hint { padding: 10px 12px; border-radius: 16px; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; }
.tutorial-card { width: min(680px, 100%); color: #ffffff; background: radial-gradient(circle at 12% 0%, rgba(6,182,212,0.28), transparent 30%), linear-gradient(135deg, #1e3a8a, #0f172a); border-color: rgba(125,211,252,0.35); }
.tutorial-card h2, .tutorial-card p, .tutorial-card .section-label { color: #ffffff; }
.tutorial-mark { margin-bottom: 2px; }
.tutorial-steps { display: grid; gap: 10px; }
.tutorial-steps span { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: center; padding: 12px; border-radius: 18px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.16); color: #ffffff; }
.tutorial-steps strong { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 999px; color: #1d4ed8; background: #ffffff; }
.tutorial-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.tutorial-actions .btn-soft { color: #1d4ed8; background: #ffffff; }
.tour-coach { position: fixed; right: 22px; bottom: 22px; z-index: 1250; width: min(430px, calc(100vw - 28px)); display: grid; gap: 12px; padding: 18px; border-radius: 28px; color: #ffffff; background: radial-gradient(circle at 12% 0%, rgba(6,182,212,0.28), transparent 32%), linear-gradient(135deg, #1e3a8a, #0f172a); border: 1px solid rgba(125,211,252,0.4); box-shadow: 0 32px 90px rgba(15,23,42,0.32); animation: tourPop 0.32s ease both; }
.tour-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.tour-head > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex: 1; }
.tour-head span { color: #dbeafe; font-weight: 900; }
.tour-head strong { color: #ffffff; }
.tour-mark { width: 42px; height: 42px; border-radius: 16px; box-shadow: none; }
.tour-coach h2, .tour-coach p { margin: 0; color: #ffffff; }
.tour-coach h2 { font-size: 1.35rem; line-height: 1.1; }
.tour-progress { height: 8px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,0.16); }
.tour-progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #06b6d4, #ffffff); transition: width 0.28s ease; }
.tour-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.tour-actions .btn-soft { color: #1d4ed8; background: #ffffff; }
.tour-actions .btn:disabled { opacity: 0.48; cursor: not-allowed; transform: none; }
.dark .tour-coach { background: radial-gradient(circle at 12% 0%, rgba(37,99,235,0.24), transparent 30%), #050505; border-color: #2563eb; box-shadow: 0 32px 90px rgba(0,0,0,0.7); }
.dark .modal-card small { color: #ffffff; }
.dark .modal-error { color: #ffffff; background: #7f1d1d; border-color: #991b1b; }
.dark .auth-hint { color: #ffffff; background: #0a0a0a; border-color: #1f2937; }
.close { position: absolute; top: 14px; right: 14px; }
.full { width: 100%; }
.text-button { border: 0; color: #1d4ed8; background: transparent; font-weight: 900; }
@keyframes navIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeScale { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); } 70% { box-shadow: 0 0 0 11px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }
@keyframes themeIconIn { from { opacity: 0; transform: rotate(-28deg) scale(0.72); } to { opacity: 1; transform: rotate(0deg) scale(1); } }
@keyframes tourPop { from { opacity: 0; transform: translateY(18px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes floatCard { 0%, 100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-14px) rotate(1deg); } }
@keyframes slideSoft { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(6px); } }
@media (max-width: 1120px) {
  .navbar { grid-template-columns: auto 1fr auto; }
  .side-menu { width: min(430px, calc(100vw - 24px)); padding: 24px; }
  .hero-grid, .split-layout, .connect-layout, .guide-layout, .calculator-layout, .messages-layout, .bot-layout, .posts-layout, .professor-layout, .classroom-stream { grid-template-columns: 1fr; }
  .history-panel, .post-composer, .professor-list-panel { position: static; }
  .floating-note { display: none; }
  .card-grid.three, .card-grid.four, .card-grid.essentials, .stat-grid, .admin-summary, .admin-board { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .campus-shortcuts { grid-template-columns: 1fr; }
  .campus-shortcuts > div:last-child { justify-content: flex-start; }
  .global-search { width: 100%; }
}
@media (max-width: 720px) {
  .container, .navbar { width: calc(100% - 24px); }
  .navbar { grid-template-columns: auto minmax(0, 1fr) auto; gap: 8px; padding: 10px; border-radius: 24px; }
  .menu-button, .icon-button { width: 40px; height: 40px; border-radius: 14px; }
  .global-search { display: flex; min-height: 40px; padding: 0 10px; }
  .global-search svg { width: 16px; height: 16px; }
  .global-search input { font-size: 0.88rem; min-width: 0; }
  .nav-actions { gap: 6px; }
  .language-toggle { min-height: 40px; padding: 0 10px; }
  .nav-actions .btn-primary { min-height: 40px; padding: 0 11px; }
  .side-menu { width: min(360px, calc(100vw - 18px)); padding: 18px; gap: 18px; }
  .side-menu-header .brand-mark { width: 48px; height: 48px; border-radius: 18px; }
  .menu-item { min-height: 50px; padding: 0 14px; font-size: 0.95rem; }
  .nav-actions .btn-soft { display: none; }
  .hero-grid { padding-top: 36px; gap: 32px; }
  .hero-copy h1 { font-size: 3.1rem; }
  .phone-shell { border-radius: 34px; padding: 10px; }
  .phone-screen { min-height: 520px; border-radius: 26px; padding: 14px; }
  .card-grid.three, .card-grid.two, .card-grid.four, .card-grid.essentials, .stat-grid, .filter-bar, .room-filter-bar, .file-program-grid, .resource-room-head, .course-card-grid, .material-type-grid, .course-browser-head, .material-file-item, .form-grid, .badge-grid, .professor-upload-grid, .course-materials, .professor-stats, .community-summary, .admin-summary, .admin-board, .account-row, .review-card { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; padding: 22px; }
  .question-card, .event-card, .student-card, .composer, .comment-composer, .bot-composer { grid-template-columns: 1fr; }
  .sticky-panel, .guide-detail { position: static; }
}
`;
