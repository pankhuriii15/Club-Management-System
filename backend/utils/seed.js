require('dotenv').config();
process.env.SEEDING = 'true';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const Registration = require('../models/Registration');

const seedDatabase = async () => {
  try {
    // Connect to database
    const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduevent';
    await mongoose.connect(dbURI);
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Club.deleteMany({});
    await Event.deleteMany({});
    await Payment.deleteMany({});
    await Registration.deleteMany({});
    console.log('Cleared existing collections.');



    // Helper for password hashing (for seeding bypass mongoose hooks or let hook handle it)
    // We will save using User.create so the pre('save') hook runs and hashes password.
    
    // 2. Seed Super Admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'pankhurichowbe1502@gmail.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || '7974906484';
    const adminUser = await User.create({
      name: 'Super Administrator',
      email: superAdminEmail,
      password: superAdminPassword,
      phone: '+1234567890',
      department: 'Administration',
      semester: 'N/A',
      profilePhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      role: 'admin'
    });
    console.log(`Seeded Super Admin (${superAdminEmail})`);

    // 3. Seed Coordinators (10 coordinators)
    const coordinators = [];
    const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Design', 'Business School'];
    
    // Default coordinator standard account (Club President)
    const defaultCoordinator = await User.create({
      name: 'Prof. Alex Mercer',
      email: 'president.coding@medicaps.ac.in',
      password: 'password123',
      phone: '+919876543210',
      department: 'Computer Science',
      semester: 'Faculty',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'coordinator'
    });
    coordinators.push(defaultCoordinator);

    for (let i = 2; i <= 10; i++) {
      const coord = await User.create({
        name: `Coordinator ${i}`,
        email: `president.club${i}@medicaps.ac.in`,
        password: 'password123',
        phone: `+91900000000${i}`,
        department: departments[i % departments.length],
        semester: 'Faculty',
        profilePhoto: `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=150`,
        role: 'coordinator'
      });
      coordinators.push(coord);
    }
    console.log(`Seeded ${coordinators.length} Club President Users (president.coding@medicaps.ac.in / password123)`);

    // 4. Seed Students (20 students)
    const students = [];
    // Default standard student account
    const defaultStudent = await User.create({
      name: 'Rohan Sharma',
      enrollment: 'EN12345678',
      email: 'rohan.sharma@medicaps.ac.in',
      password: 'password123',
      phone: '+919999988888',
      department: 'Computer Science',
      semester: '6th',
      profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      role: 'student'
    });
    students.push(defaultStudent);

    const studentNames = [
      'Priya Patel', 'Aarav Mehta', 'Ananya Iyer', 'Kabir Malhotra',
      'Aditi Sen', 'Ishaan Gupta', 'Diya Joshi', 'Rahul Verma',
      'Neha Nair', 'Devansh Das', 'Riya Kapoor', 'Siddharth Roy',
      'Tanya Singhal', 'Arjun Bose', 'Kavya Rao', 'Rohan Dutta',
      'Sneha Reddy', 'Aditya Mishra', 'Meera Nair'
    ];

    for (let i = 0; i < studentNames.length; i++) {
      const stud = await User.create({
        name: studentNames[i],
        enrollment: `EN2026${1000 + i}`,
        email: `student${i + 1}@medicaps.ac.in`,
        password: 'password123',
        phone: `+9199887700${i < 10 ? '0' + i : i}`,
        department: departments[i % departments.length],
        semester: `${(i % 8) + 1}th`,
        profilePhoto: `https://images.unsplash.com/photo-${1520000000000 + i * 150000}?w=150`,
        role: 'student'
      });
      students.push(stud);
    }
    console.log(`Seeded ${students.length} Student Users (rohan.sharma@medicaps.ac.in / password123)`);

    // 5. Seed Clubs (10 Clubs)
    const clubData = [
      {
        name: 'Coding Club',
        description: 'The premier programming community of the college. We host regular hackathons, coding contests, and open-source project building workshops to nurture computational thinkers.',
        category: 'Coding',
        logo: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=150',
        mission: 'To make coding a generic life skill and foster an active developer ecosystem on campus.',
        vision: 'To build standard-grade software engineers and represent our college in global events.',
        registrationFee: 200,
        establishedDate: new Date('2018-08-15'),
        president: {
          name: 'Nikhil Sen',
          email: 'nikhil.sen@college.edu',
          contact: '+918888877777',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
        },
        vicePresident: {
          name: 'Aishwarya Roy',
          email: 'aishwarya.roy@college.edu',
          contact: '+917777788888',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        },
        pastEvents: [
          { title: 'CodeSprint 2025', description: 'A 24-hour sprint to solve local community issues.', date: new Date('2025-10-10'), images: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400'] },
          { title: 'Git & GitHub Workshop', description: 'Hands-on training session for version control.', date: new Date('2025-09-02'), images: ['https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400'] }
        ],
        gallery: [
          'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500',
          'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500'
        ]
      },
      {
        name: 'AI Club',
        description: 'Explore the exciting world of Artificial Intelligence, Machine Learning, Neural Networks, and Deep Learning with fellow model builders and researchers.',
        category: 'AI/ML',
        logo: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=150',
        mission: 'Democratize AI education and teach students how to train, deploy, and evaluate deep learning models.',
        vision: 'To emerge as a lead hub for intelligence-driven technological solutions in college projects.',
        registrationFee: 250,
        establishedDate: new Date('2020-01-20'),
        president: {
          name: 'Vikram Joshi',
          email: 'vikram.joshi@college.edu',
          contact: '+919900990099',
          photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
        },
        vicePresident: {
          name: 'Shruti Iyer',
          email: 'shruti.iyer@college.edu',
          contact: '+918800880088',
          photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
        },
        pastEvents: [
          { title: 'AI Ethics Summit', description: 'Panel debates about privacy, bias, and ethics in AI systems.', date: new Date('2025-11-12'), images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'] }
        ],
        gallery: [
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500',
          'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=500'
        ]
      },
      {
        name: 'Robotics Club',
        description: 'Where hardware meets software. We construct autonomous rovers, drones, and robotic hands, participating in national levels robo-wars.',
        category: 'Robotics',
        logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150',
        mission: 'Equip students with embedded systems design, microcontrollers, and IoT integrations knowledge.',
        vision: 'Creating cutting-edge automation prototypes for industrial deployment.',
        registrationFee: 300,
        establishedDate: new Date('2019-03-05'),
        president: {
          name: 'Rajat Malhotra',
          email: 'rajat.malhotra@college.edu',
          contact: '+919777977797',
          photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
        },
        vicePresident: {
          name: 'Simran Reddy',
          email: 'simran.reddy@college.edu',
          contact: '+918666866686',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        },
        pastEvents: [
          { title: 'RoboQuest 2025', description: 'Autonomous maze-solving robotics competition.', date: new Date('2025-05-18'), images: ['https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=400'] }
        ],
        gallery: [
          'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500',
          'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500'
        ]
      },
      {
        name: 'Designers Guild',
        description: 'A community of UI/UX designers, visual illustrators, and layout artists creating beautiful experiences across all digital and print mediums.',
        category: 'Design',
        logo: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=150',
        mission: 'Spread design thinking and aesthetic principles across college development platforms.',
        vision: 'To build standard brand identities and layout frameworks.',
        registrationFee: 150,
        establishedDate: new Date('2021-07-10'),
        president: {
          name: 'Karan Sen',
          email: 'karan.sen@college.edu',
          contact: '+919555955595',
          photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
        },
        vicePresident: {
          name: 'Divya Nair',
          email: 'divya.nair@college.edu',
          contact: '+918444844484',
          photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
        },
        pastEvents: [],
        gallery: [
          'https://images.unsplash.com/photo-1558655146-d09347e92766?w=500'
        ]
      },
      {
        name: 'Shutterbugs Club',
        description: 'Capture the campus moments, events, and artistic natural details with cameras. We organize outdoor photowalks and editing workshops.',
        category: 'Photography',
        logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150',
        mission: 'Teach visual storytelling, lighting control, and digital photo editing post-processing.',
        vision: 'Creating a complete archives reservoir of college events.',
        registrationFee: 100,
        establishedDate: new Date('2019-09-09'),
        president: {
          name: 'Abhiram Roy',
          email: 'abhiram.roy@college.edu',
          contact: '+919222922292',
          photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150'
        },
        vicePresident: {
          name: 'Tanya Das',
          email: 'tanya.das@college.edu',
          contact: '+918111811181',
          photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150'
        },
        pastEvents: [],
        gallery: []
      },
      {
        name: 'Startup Cell',
        description: 'The entrepreneurship development cell on campus. We help transform raw student ideas into startup pitches, arranging incubator reviews and funding connects.',
        category: 'Entrepreneurship',
        logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150',
        mission: 'Cultivate business acumen, marketing strategies, and financial modeling capabilities among students.',
        vision: 'To see college student prototypes emerge as registered unicorn businesses.',
        registrationFee: 200,
        establishedDate: new Date('2017-01-15'),
        president: {
          name: 'Suhail Mehta',
          email: 'suhail.mehta@college.edu',
          contact: '+919000900090',
          photo: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150'
        },
        vicePresident: {
          name: 'Pallavi Rao',
          email: 'pallavi.rao@college.edu',
          contact: '+918999899989',
          photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
        },
        pastEvents: [],
        gallery: []
      },
      {
        name: 'Sports Guild',
        description: 'Coordinate inter-departmental soccer, basketball, cricket, and athletics tournaments. Training athletes for national level collegiate competitions.',
        category: 'Sports',
        logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150',
        mission: 'To make fitness a regular habit and cultivate a sportsmanship environment.',
        vision: 'Create state of the art sporting squads and maintain college trophies.',
        registrationFee: 150,
        establishedDate: new Date('2016-08-25'),
        president: {
          name: 'Varun Sharma',
          email: 'varun.sharma@college.edu',
          contact: '+919111911191',
          photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
        },
        vicePresident: {
          name: 'Mitali Saxena',
          email: 'mitali.saxena@college.edu',
          contact: '+918222822282',
          photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
        },
        pastEvents: [],
        gallery: []
      },
      {
        name: 'Symphony Club',
        description: 'For music enthusiasts, singers, instrumentalists, and composers. We compose campus albums, hosting annual battle of the bands.',
        category: 'Music',
        logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150',
        mission: 'Encourage acoustic jam sessions, vocals training, and multi-instrumental harmonies.',
        vision: 'Produce original campus compositions and host standard musical concerts.',
        registrationFee: 100,
        establishedDate: new Date('2018-11-20'),
        president: {
          name: 'Anirudh Dutta',
          email: 'anirudh.dutta@college.edu',
          contact: '+919333933393',
          photo: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=150'
        },
        vicePresident: {
          name: 'Kritika Bose',
          email: 'kritika.bose@college.edu',
          contact: '+918333833383',
          photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150'
        },
        pastEvents: [],
        gallery: []
      },
      {
        name: 'Footloose Guild',
        description: 'Learn modern, classical, hip-hop, and dynamic street dance styles with choreographers. We represent the college at national level cultural fests.',
        category: 'Dance',
        logo: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150',
        mission: 'Build physical stamina, rhythm patterns, and synchronize choreographies.',
        vision: 'To win national collegiate cultural group championships.',
        registrationFee: 100,
        establishedDate: new Date('2020-04-12'),
        president: {
          name: 'Harish Roy',
          email: 'harish.roy@college.edu',
          contact: '+919444944494',
          photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        },
        vicePresident: {
          name: 'Rupali Sen',
          email: 'rupali.sen@college.edu',
          contact: '+918555855585',
          photo: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=150'
        },
        pastEvents: [],
        gallery: []
      },
      {
        name: 'Literary Society',
        description: 'The reading, debate, poetry slam, and dramatic writing society. We publish the monthly student news magazine and organize debates.',
        category: 'Literature',
        logo: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=150',
        mission: 'Nurture creative writing, constructive arguments, public speaking, and active journalism.',
        vision: 'Create articulate, opinionated writers and speakers.',
        registrationFee: 0,
        establishedDate: new Date('2015-02-14'),
        president: {
          name: 'Adithya Nair',
          email: 'adithya.nair@college.edu',
          contact: '+919666966696',
          photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'
        },
        vicePresident: {
          name: 'Riddhi Joshi',
          email: 'riddhi.joshi@college.edu',
          contact: '+918777877787',
          photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150'
        },
        pastEvents: [],
        gallery: []
      }
    ];

    const clubs = [];
    for (let i = 0; i < clubData.length; i++) {
      const coordinator = coordinators[i % coordinators.length];
      const club = await Club.create({
        ...clubData[i],
        coordinatorId: coordinator._id
      });
      clubs.push(club);
      // Sync clubId back to the coordinator user record
      await User.findByIdAndUpdate(coordinator._id, { clubId: club._id });
    }
    console.log(`Seeded ${clubs.length} Clubs with coordinators.`);

    // 6. Seed Events (20 Events)
    const eventsData = [
      // Coding Club events
      { clubId: 0, title: 'HackFest 2026', description: 'A massive 36-hour hackathon open to all colleges. Come build, pitch, and win prizes worth 1,00,000 INR.', date: new Date('2026-08-10T09:00:00Z'), venue: 'Main Auditorium', registrationFee: 100, bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800' },
      { clubId: 0, title: 'Bug Bounty Brawl', description: 'Find critical exploits and optimize complex algorithms. Speed up compile execution times to win cash.', date: new Date('2026-09-15T14:30:00Z'), venue: 'CS Lab 3', registrationFee: 50, bannerImage: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800' },
      
      // AI Club events
      { clubId: 1, title: 'AI Hack-AI-Thon', description: 'Build predictive AI models or intelligent chat systems. Training resources, credits, and hardware supplied.', date: new Date('2026-07-22T10:00:00Z'), venue: 'Seminar Hall 1', registrationFee: 120, bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800' },
      { clubId: 1, title: 'Deep Learning Workshop', description: 'An intensive two-day masterclass explaining transformers, tokenizers, weights, and PyTorch.', date: new Date('2026-10-05T09:00:00Z'), venue: 'Conference Hall', registrationFee: 150, bannerImage: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=800' },
      
      // Robotics Club events
      { clubId: 2, title: 'Robo Wars 2026', description: 'High tension metal clashing arena battles. Custom build combat robots with wireless transmitters.', date: new Date('2026-08-25T11:00:00Z'), venue: 'College Workshop Arena', registrationFee: 200, bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800' },
      { clubId: 2, title: 'IoT Bootcamp', description: 'Build smart home automation prototypes using NodeMCU, MQTT feeds, and cloud dashboards.', date: new Date('2026-11-18T10:00:00Z'), venue: 'Robotics Lab', registrationFee: 100, bannerImage: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800' },
      
      // Designers Guild events
      { clubId: 3, title: 'UI/UX Redesign Arena', description: 'Redesign complex legacy student web portal architectures. Pitch layout choices to visual design experts.', date: new Date('2026-07-18T14:00:00Z'), venue: 'Design Lab 1', registrationFee: 50, bannerImage: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=800' },
      { clubId: 3, title: 'Figma Pro Workshop', description: 'Unleash auto layout systems, design system components, interactive animations, and responsive variants.', date: new Date('2026-09-02T10:00:00Z'), venue: 'Seminar Hall B', registrationFee: 80, bannerImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800' },
      
      // Shutterbugs Club events
      { clubId: 4, title: 'Nature Photowalk', description: 'An early morning walk exploring macro captures, shadows, and natural portrait parameters.', date: new Date('2026-07-05T06:00:00Z'), venue: 'Sanjay National Park Campus', registrationFee: 30, bannerImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800' },
      { clubId: 4, title: 'Lightroom Editing Suite', description: 'Learn how to correct curves, balance split tones, crop, and manipulate filters.', date: new Date('2026-10-10T15:00:00Z'), venue: 'Shutter Room', registrationFee: 50, bannerImage: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=800' },

      // Startup Cell events
      { clubId: 5, title: 'Shark Tank Campus Edition', description: 'Pitch raw startups to active angel VCs. Secure seed grants and incubator space.', date: new Date('2026-08-08T10:00:00Z'), venue: 'B-School Audit', registrationFee: 150, bannerImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800' },
      { clubId: 5, title: 'Pitch Deck Creation Seminars', description: 'Learn how to compose clear graphs, calculate market TAM/SAM/SOM, and design financials.', date: new Date('2026-09-20T11:00:00Z'), venue: 'Incubator Cell', registrationFee: 0, bannerImage: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=800' },

      // Sports Guild events
      { clubId: 6, title: 'Premier Football League', description: 'Inter-department 11v11 soccer cup. Group stages followed by qualifiers under floodlights.', date: new Date('2026-08-01T16:00:00Z'), venue: 'Main Football Fields', registrationFee: 150, bannerImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800' },
      { clubId: 6, title: 'Dribble Mania Basketball', description: 'Half court 3v3 basketball match. Knockout format with sudden death rules.', date: new Date('2026-09-10T17:00:00Z'), venue: 'Indoor Sports Arenas', registrationFee: 80, bannerImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800' },

      // Symphony Club events
      { clubId: 7, title: 'Unplugged Jam Night', description: 'Acoustic evening with guitars, keyboards, violin, and vocals. Open mic for all.', date: new Date('2026-07-30T18:00:00Z'), venue: 'Amphitheatre', registrationFee: 50, bannerImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800' },
      { clubId: 7, title: 'Rhythm Battle of Bands', description: 'Amplified rock, pop, and metal face-offs. The winner records an original campus soundtrack.', date: new Date('2026-10-25T17:30:00Z'), venue: 'OAT (Open Air Theatre)', registrationFee: 100, bannerImage: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=800' },

      // Footloose Guild events
      { clubId: 8, title: 'Street Dance Face-Offs', description: '1v1 cyphers and group street sync battles. Dynamic judges panel judging street cred and rhythm.', date: new Date('2026-08-18T16:30:00Z'), venue: 'College Quadrangle', registrationFee: 50, bannerImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800' },
      { clubId: 8, title: 'Kathak & Fusion Workshop', description: 'Learn how to weave classical footwork patterns into dynamic modern cinematic tracks.', date: new Date('2026-09-28T09:00:00Z'), venue: 'Auditorium Stage B', registrationFee: 60, bannerImage: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800' },

      // Literary Society events
      { clubId: 9, title: 'Grand Campus Debate 2026', description: 'Argue and counter key social, philosophical, and campus developments to lift the trophy.', date: new Date('2026-07-10T11:00:00Z'), venue: 'Seminar Hall C', registrationFee: 0, bannerImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800' },
      { clubId: 9, title: 'Poetry Slam Night', description: 'Recite original free-verse poems. Express, feel, and vibe with fellow campus writers.', date: new Date('2026-09-08T18:00:00Z'), venue: 'Central Library Lawn', registrationFee: 0, bannerImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800' }
    ];

    const events = [];
    for (let i = 0; i < eventsData.length; i++) {
      const data = eventsData[i];
      const associatedClub = clubs[data.clubId];
      const event = await Event.create({
        ...data,
        clubId: associatedClub._id,
        galleryImages: [
          'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500',
          'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500'
        ]
      });
      events.push(event);
    }
    console.log(`Seeded ${events.length} Upcoming Events across clubs.`);



    // 8. Seed Registrations (Make some registrations for testing)
    // We will generate some dummy registrations.

    // Rohan Sharma (student@eduevent.com) has a registration for Coding Club (Approved)
    const codingClub = clubs[0];
    
    await Registration.create({
      userId: defaultStudent._id,
      clubId: codingClub._id,
      paymentId: null,
      status: 'Approved',
      remarks: 'Welcome to the club Rohan!',
      registrationDate: new Date('2026-06-01')
    });

    // Rohan Sharma has a pending registration for AI Hack-AI-Thon
    const aiEvent = events[2]; // AI Hack-AI-Thon

    await Registration.create({
      userId: defaultStudent._id,
      eventId: aiEvent._id,
      paymentId: null,
      status: 'Pending',
      remarks: '',
      registrationDate: new Date('2026-06-10')
    });

    // Rohan Sharma has a registration for the Free Debate event (Approved, no payment)
    const freeDebate = events[18]; // Debate Event (Literary Club)
    await Registration.create({
      userId: defaultStudent._id,
      eventId: freeDebate._id,
      paymentId: null,
      status: 'Selected',
      remarks: 'Shortlisted for debate speaker list',
      registrationDate: new Date('2026-06-11')
    });

    // Let's seed 15 more registrations from other random students
    const statuses = ['Pending', 'Approved', 'Rejected', 'Shortlisted', 'Selected'];
    for (let k = 1; k < 12; k++) {
      const student = students[k % students.length];
      const club = clubs[k % clubs.length];
      const status = statuses[k % statuses.length];
      
      await Registration.create({
        userId: student._id,
        clubId: club._id,
        paymentId: null,
        status: status,
        remarks: status === 'Rejected' ? 'Incomplete application forms.' : 'Registered from seed data.',
        registrationDate: new Date('2026-06-05')
      });
    }

    // Add registration for some random events
    for (let k = 1; k < 12; k++) {
      const student = students[(k + 3) % students.length];
      const event = events[k % events.length];
      const status = statuses[(k + 2) % statuses.length];

      await Registration.create({
        userId: student._id,
        eventId: event._id,
        paymentId: null,
        status: status,
        remarks: status === 'Approved' || status === 'Selected' ? 'See you at the venue!' : '',
        registrationDate: new Date('2026-06-07')
      });
    }

    console.log('Seeded database with dummy registration records (no payments).');
    console.log('Database Seeding Completed Successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
