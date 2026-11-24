import type { SiteContent } from "@/types/domain";

/** Default public copy. Admins edit all of it from Admin → Site content. */
export const siteContent: SiteContent = {
  hero: {
    badge: "New",
    eyebrow: "Reallogixs Academy",
    title: "Learn the skills that build",
    highlight: "real products.",
    subtitle:
      "Live, mentor-led courses in software, AI, design and marketing, taught by the engineers who ship client work at Reallogixs. Join on campus in Lahore or online from anywhere.",
    primaryCta: "Browse courses",
    secondaryCta: "Track my enrolment",
    upcomingLabel: "Enrolling now",
  },
  sections: {
    featured: {
      label: "Featured courses",
      title: "Next batches starting soon",
      highlight: "",
      description: "Small, live batches with a mentor who ships real client work.",
    },
    categories: {
      label: "Explore by category",
      title: "Pick a path, then go deep",
      highlight: "",
      description:
        "Every category nests into focused tracks, so you can start broad and specialise.",
    },
    howItWorks: {
      label: "How it works",
      title: "From browsing to your first class in four steps",
      highlight: "",
      description: "",
    },
    stats: {
      label: "By the numbers",
      title: "Small batches.",
      highlight: "Real outcomes.",
      description: "",
    },
    testimonials: {
      label: "Student stories",
      title: "Don't take our word.",
      highlight: "Take theirs.",
      description: "Students who joined a batch, built something real and kept going.",
    },
    faq: {
      label: "FAQ",
      title: "Questions, answered",
      highlight: "",
      description: "Can't find what you need? We reply quickly.",
    },
  },
  pages: {
    courses: {
      label: "Courses",
      title: "Find your next skill",
      body: "Live, mentor-led batches with real projects. Pick a category, choose online or on campus, and enrol in minutes.",
    },
    track: {
      label: "Track enrolment",
      title: "Where's my enrolment?",
      body: "Enter the order number from checkout and the phone number you used. Demo: try RLX-9GUEST with 0344 1112233.",
    },
    login: {
      label: "Welcome back",
      title: "Log in",
      body: "Students, teachers and admins all log in here. Teacher accounts are created by the Reallogixs team.",
      asideTitle: "One login, three portals.",
      asideBody:
        "Students see their courses and receipts. Teachers see referrals and earnings. Admins run the academy.",
    },
    signup: {
      label: "Student account",
      title: "Keep your learning in one place",
      body: "An account is optional. It lets you see every enrolment, receipt and certificate together. Earlier orders made with the same email or phone are added automatically.",
      asideTitle: "Your history, receipts and certificates.",
      asideBody:
        "Re-upload a receipt, find your WhatsApp community link and download certificates any time.",
    },
  },
  coursePage: {
    aboutLabel: "About this course",
    outcomesLabel: "What you'll be able to do",
    instructorLabel: "Your instructor",
    enrolNote: "No account needed. Pay by JazzCash, Easypaisa, SadaPay, NayaPay or bank transfer.",
  },
  stats: [
    // PLACEHOLDER: replace with real numbers before launch.
    { label: "Students trained", value: "1,200+" },
    { label: "Live courses", value: "12" },
    { label: "Hiring partners", value: "30+" },
    { label: "Average rating", value: "4.8/5" },
  ],
  steps: [
    {
      title: "Pick a course",
      body: "Browse by category, check the schedule and choose online or on campus.",
    },
    {
      title: "Pay your way",
      body: "JazzCash, Easypaisa, SadaPay, NayaPay or bank transfer. Add your teacher's promo code if you have one.",
    },
    {
      title: "Upload the receipt",
      body: "Send a screenshot of your payment. No account needed, though signing up keeps your history in one place.",
    },
    {
      title: "Join the community",
      body: "Once we confirm your payment you get the Reallogixs WhatsApp community link and class details.",
    },
  ],
  testimonials: [
    {
      id: "tst_1",
      name: "Ali R.",
      role: "AI Agents student",
      quote:
        "I built and deployed a support chatbot for my uncle's shop in week six. The live sessions made the hard parts click.",
      isPlaceholder: true,
    },
    {
      id: "tst_2",
      name: "Zara H.",
      role: "Full-stack student",
      quote:
        "Clear, practical and patient teaching. I finally understand how the whole stack fits together.",
      isPlaceholder: true,
    },
    {
      id: "tst_3",
      name: "Hira S.",
      role: "UI/UX student",
      quote: "The portfolio case study we built got me my first freelance client.",
      isPlaceholder: true,
    },
  ],
  faqs: [
    {
      id: "faq_1",
      question: "Do I need an account to enrol?",
      answer:
        "No. You can check out as a guest and track your enrolment with your order number and phone number. Creating an account keeps all your courses and receipts in one place.",
    },
    {
      id: "faq_2",
      question: "What is a promo code?",
      answer:
        "If a teacher referred you, they will give you a promo code. Enter it at checkout. Some codes also include a discount. You can skip it if you don't have one.",
    },
    {
      id: "faq_3",
      question: "How long does payment verification take?",
      answer:
        "We usually verify receipts within a few working hours, and always within one working day.",
    },
    {
      id: "faq_4",
      question: "What if my receipt is rejected?",
      answer:
        "We'll tell you why, for example a wrong amount or an unclear screenshot. You can upload a new receipt from the Track enrolment page or your student portal.",
    },
    {
      id: "faq_5",
      question: "Do I get a certificate?",
      answer:
        "Yes. Students who complete a course receive a Reallogixs certificate with a verification code.",
    },
  ],
  community: {
    whatsappUrl: "https://chat.whatsapp.com/REALLOGIXS-DEMO-LINK",
    title: "You're in. Welcome to Reallogixs.",
    body: "Join the Reallogixs WhatsApp community for class links, announcements, resources and a network of fellow builders.",
  },
  contact: {
    email: "hello@reallogixs.com.au",
    // PLACEHOLDER: real numbers to come.
    phone: "+92 300 0000000",
    whatsapp: "+92 300 0000000",
    address: "Johar Town, Lahore, Pakistan",
  },
  checkout: {
    promoHelp: "Got a code from your teacher? Enter it here. No code? Just skip this step.",
    receiptHelp:
      "Upload a clear screenshot or photo of your payment confirmation (JPG, PNG or PDF, up to 4 MB).",
    pendingMessage:
      "Thanks! We've received your receipt. Our team will verify it shortly and you'll see your WhatsApp community link here once it's confirmed.",
  },
  footer: {
    headline: "Learn something",
    highlight: "real.",
    ctaLabel: "Browse courses",
    tagline: "A Reallogixs initiative · reallogixs.com.au",
    blurb:
      "Reallogixs Academy is the learning initiative of Reallogixs, a software and AI agency building for clients in Australia and around the world.",
  },
};
