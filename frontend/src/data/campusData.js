// Indore Engineering College - Campus Landmarks & Pathway Graph Dataset

export const campusLocations = [
  {
    id: 1,
    name: 'Main Gate (Campus Entry)',
    category: 'Facilities',
    building: 'Entrance Plaza',
    floor: 1,
    latitude: 22.7254,
    longitude: 75.8710,
    description: 'Main campus entrance gate, visitor check-in, 24/7 security booth, and shuttle pickup.'
  },
  {
    id: 2,
    name: 'Admin Block (Dean & Accounts)',
    category: 'Offices',
    building: 'Administrative Complex',
    floor: 1,
    latitude: 22.7258,
    longitude: 75.8718,
    description: 'Offices of the Dean, Registrar, student admissions, fee payment counter, and scholarship cell.'
  },
  {
    id: 3,
    name: 'CS Department (HOD Office)',
    category: 'Departments',
    building: 'Computer Engineering Block',
    floor: 1,
    latitude: 22.7265,
    longitude: 75.8722,
    description: 'Computer Science Department HOD cabin, faculty meeting room, and staff offices.'
  },
  {
    id: 4,
    name: 'CS 1 Classroom (Ground Floor)',
    category: 'Classrooms',
    building: 'Computer Engineering Block',
    floor: 1,
    latitude: 22.7264,
    longitude: 75.8725,
    description: '1st Year B.Tech Computer Science lecture hall equipped with smartboard & dual displays.'
  },
  {
    id: 5,
    name: 'CS 2 Classroom (1st Floor)',
    category: 'Classrooms',
    building: 'Computer Engineering Block',
    floor: 2,
    latitude: 22.7265,
    longitude: 75.8725,
    description: '2nd Year B.Tech Computer Science core classroom (1st Floor / Level 2).'
  },
  {
    id: 6,
    name: 'CS 3 Classroom (2nd Floor)',
    category: 'Classrooms',
    building: 'Computer Engineering Block',
    floor: 3,
    latitude: 22.7266,
    longitude: 75.8725,
    description: '3rd Year B.Tech Computer Science senior lecture hall (2nd Floor / Level 3).'
  },
  {
    id: 7,
    name: 'AI & Data Science Lab',
    category: 'Labs',
    building: 'Computer Engineering Block',
    floor: 3,
    latitude: 22.7268,
    longitude: 75.8728,
    description: 'Advanced computing lab with GPU workstations for Machine Learning, Deep Learning, and AI.'
  },
  {
    id: 8,
    name: 'Coding Lab 1',
    category: 'Labs',
    building: 'Computer Engineering Block',
    floor: 1,
    latitude: 22.7263,
    longitude: 75.8728,
    description: 'Software development lab with high-speed Linux terminals for DSA and competitive coding.'
  },
  {
    id: 9,
    name: 'Physics & Electronics Lab',
    category: 'Labs',
    building: 'Science & Core Engineering Block',
    floor: 2,
    latitude: 22.7248,
    longitude: 75.8724,
    description: 'Basic sciences lab, circuit design workstations, oscilloscopes, and optics equipment.'
  },
  {
    id: 10,
    name: 'Mechanical Workshop',
    category: 'Labs',
    building: 'Mechanical & Heavy Engineering Block',
    floor: 1,
    latitude: 22.7242,
    longitude: 75.8720,
    description: 'Foundry, CNC machines, lathe tools, welding bays, and mechanical prototyping facility.'
  },
  {
    id: 11,
    name: 'Central Library & Reading Hall',
    category: 'Facilities',
    building: 'Central Library Block',
    floor: 1,
    latitude: 22.7256,
    longitude: 75.8732,
    description: '3-story central library with IEEE digital access, 100,000+ volumes, and 24/7 quiet study hall.'
  },
  {
    id: 12,
    name: 'College Canteen / Nescafe Point',
    category: 'Facilities',
    building: 'Student Amenity Hub',
    floor: 1,
    latitude: 22.7250,
    longitude: 75.8735,
    description: 'Main college food court, Nescafe coffee kiosk, South Indian snacks, and outdoor garden seating.'
  },
  {
    id: 13,
    name: 'Auditorium / Seminar Hall',
    category: 'Classrooms',
    building: 'Auditorium Complex',
    floor: 1,
    latitude: 22.7253,
    longitude: 75.8728,
    description: '800-seat grand auditorium for hackathons, technical conferences, and cultural events.'
  },
  {
    id: 14,
    name: 'Boys Hostel',
    category: 'Facilities',
    building: 'Boys Residential Wing',
    floor: 1,
    latitude: 22.7242,
    longitude: 75.8735,
    description: 'Student hostel residence for men with dining hall and indoor sports room.'
  },
  {
    id: 15,
    name: 'Girls Hostel',
    category: 'Facilities',
    building: 'Girls Residential Wing',
    floor: 1,
    latitude: 22.7262,
    longitude: 75.8712,
    description: 'Student hostel residence for women with biometric security and study lounge.'
  },
  {
    id: 16,
    name: 'Sports Complex & Ground',
    category: 'Facilities',
    building: 'Athletics Ground',
    floor: 1,
    latitude: 22.7268,
    longitude: 75.8738,
    description: 'Cricket/football ground, basketball courts, badminton hall, and fitness gymnasium.'
  }
];

export const campusRoutes = [
  // Main Gate ↔ Admin Block ↔ CS Block pathways
  { from: 1, to: 2, dist: 95, inst: 'Exit Main Gate and walk East along the main entrance avenue to Admin Block.' },
  { from: 1, to: 15, dist: 90, inst: 'Head Northeast along the shaded pathway toward Girls Hostel.' },
  { from: 1, to: 10, dist: 170, inst: 'Walk Southeast along the outer road toward the Mechanical Workshop.' },

  // Admin Block connections
  { from: 2, to: 3, dist: 85, inst: 'Walk Northeast from Admin Block through the Central Plaza to CS Department.' },
  { from: 2, to: 13, dist: 110, inst: 'Walk East past the central lawn directly to Auditorium / Seminar Hall.' },
  { from: 2, to: 9, dist: 120, inst: 'Head South along the paved path toward Physics & Electronics Lab.' },

  // CS Department ↔ CS Classrooms (CS 1, 2, 3), AI Lab, Coding Lab
  { from: 3, to: 4, dist: 25, inst: 'Walk down the ground floor corridor into CS 1 Classroom.' },
  { from: 3, to: 5, dist: 35, inst: 'Take the central staircase or elevator to 1st Floor for CS 2 Classroom.' },
  { from: 3, to: 6, dist: 50, inst: 'Take the central staircase or elevator to 2nd Floor for CS 3 Classroom.' },
  { from: 4, to: 5, dist: 30, inst: 'Take the CS block internal stairs up to 1st Floor for CS 2 Classroom.' },
  { from: 5, to: 6, dist: 30, inst: 'Take the CS block internal stairs up to 2nd Floor for CS 3 Classroom.' },
  { from: 6, to: 7, dist: 25, inst: 'Walk down the 2nd floor research wing into AI & Data Science Lab.' },
  { from: 3, to: 7, dist: 55, inst: 'Take the CS elevator or main stairs to 2nd Floor for AI & Data Science Lab.' },
  { from: 4, to: 8, dist: 30, inst: 'Walk down the ground floor east wing to Coding Lab 1.' },
  { from: 3, to: 8, dist: 35, inst: 'Walk through the ground floor lobby into Coding Lab 1.' },

  // CS Block & AI Lab to Central Library & Sports Ground
  { from: 3, to: 11, dist: 140, inst: 'Walk Southeast along the tech corridor directly to Central Library & Reading Hall.' },
  { from: 7, to: 11, dist: 155, inst: 'Exit CS 2nd floor via east stairs and walk South to Central Library.' },
  { from: 7, to: 16, dist: 110, inst: 'Walk East past the IT wing toward the Sports Complex & Ground.' },
  { from: 8, to: 11, dist: 120, inst: 'Walk Southeast from Coding Lab along the garden path to Central Library.' },

  // Central Library connections
  { from: 11, to: 13, dist: 65, inst: 'Walk West from Library front plaza to Auditorium / Seminar Hall.' },
  { from: 11, to: 12, dist: 75, inst: 'Walk South from Library entrance directly to College Canteen / Nescafe Point.' },
  { from: 11, to: 16, dist: 145, inst: 'Walk Northeast along the sports avenue toward Sports Complex & Ground.' },

  // Auditorium & Canteen connections
  { from: 13, to: 12, dist: 70, inst: 'Walk Southeast through the central breezeway to College Canteen / Nescafe Point.' },
  { from: 13, to: 4, dist: 125, inst: 'Walk Northwest from Auditorium along the quad corridor to CS 1 Classroom.' },
  { from: 13, to: 9, dist: 75, inst: 'Walk Southwest along the science walkway to Physics & Electronics Lab.' },
  { from: 12, to: 4, dist: 165, inst: 'Walk Northwest across the central quad past Auditorium to CS 1 Classroom.' },
  { from: 12, to: 14, dist: 90, inst: 'Walk South along the hostel pathway to Boys Hostel.' },

  // Physics Lab, Mechanical Workshop & Hostels
  { from: 9, to: 10, dist: 80, inst: 'Walk South from Physics Lab directly to Mechanical Workshop.' },
  { from: 9, to: 12, dist: 115, inst: 'Walk East past the student pavilion toward College Canteen.' },
  { from: 10, to: 14, dist: 150, inst: 'Walk East along the southern perimeter road toward Boys Hostel.' },
  { from: 15, to: 3, dist: 110, inst: 'Walk East from Girls Hostel across the garden directly to CS Department.' }
];
