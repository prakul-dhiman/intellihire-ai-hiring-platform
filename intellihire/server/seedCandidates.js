const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Resume = require("./models/Resume");

// Load env
dotenv.config();

const candidatesData = [
    {
        name: "Aarav Patel",
        email: "aarav.p@example.com",
        password: "password123",
        role: "candidate",
        resumeData: {
            skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
            experience: 4,
            education: "B.Tech in Computer Science, IIT Bombay",
            summary:
                "Full-stack developer with 4 years of experience building scalable SaaS products. Proficient in the MERN stack and cloud deployments on AWS.",
            score: 92,
            certifications: ["AWS Certified Developer - Associate", "MongoDB Certified Professional"],
            projects: [
                { name: "E-Commerce Platform", desc: "Built a microservices-based e-commerce backend handling 10k orders/day." },
                { name: "Real-time Chat App", desc: "Implemented WebSocket based chat supporting groups and read receipts." }
            ],
            links: { linkedin: "https://linkedin.com/in/aarav-p", github: "https://github.com/aarav-p" }
        },
        scores: { codingScore: 95, interviewScore: 88, interviewFeedback: "Clear communication, deep understanding of distributed systems, and confident coding." }
    },
    {
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        password: "password123",
        role: "candidate",
        resumeData: {
            skills: ["Python", "Django", "Machine Learning", "TensorFlow", "PostgreSQL"],
            experience: 6,
            education: "M.S. in Data Science, Stanford University",
            summary:
                "Senior Data Engineer / ML Engineer with a strong background in building predictive models and developing scalable data pipelines.",
            score: 96,
            certifications: ["Google Cloud Professional Data Engineer"],
            projects: [
                { name: "Recommendation Engine", desc: "Developed a recommendation engine boosting content engagement by 30%." },
                { name: "Financial Forecasting", desc: "Built predictive LSTM models for stock market trend analysis." }
            ],
            links: { linkedin: "https://linkedin.com/in/priya-sharma", github: "https://github.com/priyasharma-code" }
        },
        scores: { codingScore: 92, interviewScore: 95, interviewFeedback: "Excellent system design skills and profound knowledge in setting up ML pipelines efficiently." }
    },
    {
        name: "Rohan Gupta",
        email: "rg.coder@example.com",
        password: "password123",
        role: "candidate",
        resumeData: {
            skills: ["Java", "Spring Boot", "MySQL", "Docker", "Kubernetes"],
            experience: 2,
            education: "B.E. in Information Technology, BITS Pilani",
            summary:
                "Passionate backend developer focused on building robust APIs. Eager to solve complex challenges and learn modern cloud technologies.",
            score: 75,
            certifications: [],
            projects: [
                { name: "Banking API", desc: "Created secure Spring Boot REST APIs with JWT authentication." }
            ],
            links: { github: "https://github.com/rg-coder" }
        },
        scores: { codingScore: 80, interviewScore: 68, interviewFeedback: "Good grasp of core Java, but lacks confidence in cloud deployments and advanced system design." }
    },
    {
        name: "Sneha Iyer",
        email: "sneha.iyer@example.com",
        password: "password123",
        role: "candidate",
        resumeData: {
            skills: ["JavaScript", "HTML5", "CSS3", "React", "Figma", "Tailwind CSS"],
            experience: 3,
            education: "B.Des in Interaction Design, NID Bangalore",
            summary:
                "Creative Frontend Developer blurring the line between design and code. Strong focus on accessibility, animations, and pixel-perfect UIs.",
            score: 88,
            certifications: ["Frontend Masters Advanced React"],
            projects: [
                { name: "Dashboard UI Library", desc: "Developed a reusable component library used by 3 separate product teams." },
                { name: "Crypto Portfolio App", desc: "Built an interactive crypto tracker using Recharts and Tailwind CSS." }
            ],
            links: { portfolio: "https://snehacodes.dev", linkedin: "https://linkedin.com/in/snehaiyer" }
        },
        scores: { codingScore: 85, interviewScore: 90, interviewFeedback: "Outstanding at UI implementation and translating Figma to code. Answered all React questions perfectly." }
    },
    {
        name: "Vikram Singh",
        email: "vikram.s@example.com",
        password: "password123",
        role: "candidate",
        resumeData: {
            skills: ["C++", "C", "Embedded Systems", "RTOS", "Linux Device Drivers"],
            experience: 8,
            education: "B.Tech in Electronics, NIT Trichy",
            summary:
                "Veteran Embedded Systems Engineer with deep expertise in writing high-performance low-level C/C++ code for IoT devices and automotive systems.",
            score: 94,
            certifications: [],
            projects: [
                { name: "Smart AC Controller", desc: "Programmed the core logic for an IoT smart air conditioner." },
                { name: "Custom Bootloader", desc: "Wrote a custom secure bootloader over UART/SPI for a Cortex-M4 MCU." }
            ],
            links: { linkedin: "https://linkedin.com/in/vikram-singh-embedded" }
        },
        scores: { codingScore: 100, interviewScore: 84, interviewFeedback: "Flawless coding skills in C/C++. Deep technical knowledge. Communication was slightly dry but very accurate." }
    },
    {
        name: "Neha Verma",
        email: "nehav@example.com",
        password: "password123",
        role: "candidate",
        resumeData: {
            skills: ["PHP", "Laravel", "Vue.js", "MySQL", "Redis"],
            experience: 5,
            education: "BCA, Symbiosis University",
            summary:
                "Full-stack Web Artisan using Laravel and Vue.js. Experience in migrating legacy codebases to modern MVC architectures.",
            score: 82,
            certifications: ["O'Reilly Advanced PHP"],
            projects: [
                { name: "CRM Migration", desc: "Migrated a 10-year-old CRM to Laravel 10, improving query performance by 40%." }
            ],
            links: { github: "https://github.com/nv-code" }
        },
        scores: { codingScore: 78, interviewScore: 75, interviewFeedback: "Solid experience with Web basics, but struggled slightly with advanced algorithm questions." }
    },
    {
        name: "Karan Desai",
        email: "kdesai.sec@example.com",
        password: "password123",
        role: "candidate",
        resumeData: {
            skills: ["Cybersecurity", "Penetration Testing", "Python", "Bash", "AWS Security"],
            experience: 3,
            education: "B.Tech in CS (Cybersecurity Spec.), VJTI Mumbai",
            summary:
                "Security researcher and penetration tester finding vulnerabilities before attackers do. Bug bounty hunter in spare time.",
            score: 89,
            certifications: ["CEH", "OSCP"],
            projects: [
                { name: "Automated Vuln Scanner", desc: "Wrote a python script integrating Nmap and Nikto for rapid scanning." },
                { name: "Bug Bounty Reports", desc: "Acknowledged by 5+ organizations for finding critical IDOR / XSS vulnerabilities." }
            ],
            links: { linkedin: "https://linkedin.com/in/karandesai", portfolio: "https://hackerone.com/kdesai" }
        },
        scores: { codingScore: 88, interviewScore: 92, interviewFeedback: "Very passionate about security. Walked me through a complete kill-chain scenario flawlessly." }
    }
];

async function seed() {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/intellihire";
        await mongoose.connect(mongoUri);
        console.log("Connected to DB...");

        // Optionally uncomment to clean existing users (BE CAREFUL IN PROD)
        // await User.deleteMany({ role: "candidate" });
        // await Resume.deleteMany({});

        for (const cand of candidatesData) {
            // Check if user exists
            const existing = await User.findOne({ email: cand.email });
            if (existing) {
                console.log(`Skipping ${cand.email}, already exists.`);
                continue;
            }

            // Create User
            const user = new User({
                name: cand.name,
                email: cand.email,
                password: cand.password,
                role: cand.role,
                resumeScore: cand.resumeData.score,
                codingScore: cand.scores.codingScore,
                interviewScore: cand.scores.interviewScore,
                interviewFeedback: cand.scores.interviewFeedback,
            });
            user.calculateFinalScore();
            await user.save();

            // Create Resume
            const resume = new Resume({
                candidateId: user._id,
                skills: cand.resumeData.skills,
                experience: cand.resumeData.experience,
                education: cand.resumeData.education,
                summary: cand.resumeData.summary,
                score: cand.resumeData.score,
                certifications: cand.resumeData.certifications,
                projects: cand.resumeData.projects,
                links: cand.resumeData.links,
            });
            await resume.save();

            console.log(`Created Candidate: ${user.name} with Resume & Scores.`);
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
}

seed();
