// Snapshot of the events that existed in local development, used to populate a
// fresh database on first boot. Kept as .ts (not .json) so it is compiled into
// dist/ by 'nest build' with no assets config to get wrong.
//
// Regenerate after adding events locally:
//   node scripts/export-events.mjs

export type SeedEvent = {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  tags: string[];
  price: number;
  imageUrl: string | null;
};

export const SEED_EVENTS: SeedEvent[] = [
  {
    "title": "Rongila Utshob",
    "description": "A carefully designed cultural experience that brings together traditional Bengali culture with a simple modern feel. It includes familiar elements like colors, food and music, but presented in a fresh and stylish way. The idea is to help people enjoy the warmth of the old traditional festival while also making it feel comfortable and relevant today.",
    "date": "2026-04-14T09:00:00.000Z",
    "location": "Kamal Ataturk Park, Banani",
    "capacity": 500,
    "tags": [
      "Festival",
      "Boishakh",
      "Folk"
    ],
    "price": 0,
    "imageUrl": "/uploads/507785fa-229e-4dfc-9331-7cc78c6902c1.jpeg"
  },
  {
    "title": "AIUB Tech Conference 2026",
    "description": "A student tech event with workshops and guest speakers.",
    "date": "2026-05-15T09:00:00.000Z",
    "location": "AIUB Campus, Dhaka",
    "capacity": 100,
    "tags": [
      "AI",
      "Software"
    ],
    "price": 0,
    "imageUrl": "/uploads/e2320a48-8b9a-46b6-adc8-c1248d3c9ab3.png"
  },
  {
    "title": "RockaRolla - Reforged",
    "description": "“ROCKA ROLLA – REFORGED” is a high-energy, premium open-air concert that reignites the raw power of classic rock with a bold, modern twist. Set against an electrifying atmosphere at KIB Field, this unforgettable night unfolds on 15 May 2026, bringing together a powerhouse lineup of performers including Warfaze, Nemesis, Avoid Rafa, Mechanix, EZ, Blue Jeans, AK Rahul, and Prisoners.\r\n\r\nFrom gritty guitar riffs to explosive live performances, the event celebrates timeless rock anthems reimagined for a new generation. Rocka Rolla - Reforged is where nostalgia meets innovation, uniting passionate fans under the open sky for an immersive experience filled with music, energy, and pure rock spirit.",
    "date": "2026-05-20T09:00:00.000Z",
    "location": "Banglamotor, Dhaka, Bangladesh",
    "capacity": 199,
    "tags": [
      "Warfaze",
      "Nemisis"
    ],
    "price": 0,
    "imageUrl": "/uploads/8aa9259f-a9cc-4580-9517-06cb35e86049.jpg"
  },
  {
    "title": "Cosmic Omniverse Expo-2026",
    "description": "🌌 Cosmic OmniVerse Expo 2026 – Event Brief\r\n\r\nGet ready to step into a world where every universe collides.\r\n\r\nCosmic OmniVerse Expo 2026 is Bangladesh’s ultimate all-in-one pop culture convention, bringing together fans of Marvel, DC, Anime, Web Series, Gaming, and beyond into one massive experience. From superheroes to anime legends, from dark anti-heroes to multiverse icons, this is where your fandom comes alive.",
    "date": "2026-05-28T09:00:00.000Z",
    "location": "BGB Banquet Hall,Shimanto Square,Dhanmondi",
    "capacity": 100,
    "tags": [
      "Cosplay Competition",
      "OmniVerse Magic Show",
      "Multiverse Movie & Anime Quiz"
    ],
    "price": 0,
    "imageUrl": "/uploads/217219ef-e3dc-46b1-9aeb-8317ff9a06c7.jpeg"
  },
  {
    "title": "Business Fest Bangladesh 2026 | Edition-X",
    "description": "Talent exists everywhere but only a few get the chance to present it on a grand stage. For decades, Notre Dame Business Club (NDBC) has been creating that platform where ideas are tested, skills are sharpened and future leaders begin their journey.\r\n\r\nFounded in 1973, NDBC is one of the pioneers of college-level excellence in Bangladesh. With more than fifty years of legacy, the club has continuously worked to develop leadership, business insight, creativity and analytical thinking among students across the country.\r\n\r\nBusiness Fest Bangladesh (BFB), NDBC’s flagship event, is the reflection of this legacy. Now celebrating Business Fest Bangladesh 2026 | Edition-X, The Golden Edition, the fest promises a bigger and more impactful experience, featuring diverse competitive, creative and knowledge-based segments that allow every participant to showcase their true potential.",
    "date": "2026-05-29T09:00:00.000Z",
    "location": "Gulshan1,Dhaka",
    "capacity": 100,
    "tags": [
      "Cosplay Competition",
      "OmniVerse Magic Show",
      "Multiverse Movie & Anime Quiz"
    ],
    "price": 0,
    "imageUrl": "/uploads/47aec744-edc6-49e9-a60b-5611aceb9941.jpg"
  },
  {
    "title": "Carpe Diem Rishka Festival: Seize the Cinema",
    "description": "Rishka Festival is the first-ever thematic festival chain  celebrating our culture and the spirit of storytelling.\r\n\r\nCarpe Diem Rishka Festival: Seize the Cinema returns with a new theme: the biggest celebration of Bangladeshi cinema, bringing together filmmakers, artists, and audiences to experience cinema beyond the screen.\r\n\r\nFrom powerful film screenings and inspiring conversations with creators to live performances and immersive experiences, this is where stories truly come alive. Join us 26th, 27th & 28th March at Aloki, Gulshan for three unforgettable days of creativity, culture, and cinema. ",
    "date": "2026-06-10T09:00:00.000Z",
    "location": "Gulshan1,Dhaka",
    "capacity": 200,
    "tags": [
      "Yamaha",
      "Seylon",
      "Tickify"
    ],
    "price": 0,
    "imageUrl": "/uploads/6f42e6b0-01a9-4b61-bca6-19d4d8da27b2.png"
  },
  {
    "title": "Athens Epidaurus Festival 2026 - A New Cultural Experience",
    "description": "The anticipation for the Athens Epidaurus Festival has been building up globally because of the integration of Ancient Greek Theatre and contemporary performances, alongside world-class music. Festivals of this kind are held around the world, but none of them compare to what this festival has to offer. Epidaurus is known around the world as the cradle of modern civilization, and this festival is an attempt to showcase the culture of the region in its most authentic form.",
    "date": "2026-06-25T09:00:00.000Z",
    "location": "Athens",
    "capacity": 1000,
    "tags": [
      "Cosplay Competition",
      "OmniVerse Magic Show",
      "Multiverse Movie & Anime Quiz"
    ],
    "price": 0,
    "imageUrl": "/uploads/33fb12c6-b3e3-4b47-8cad-08aaec690b7d.jpg"
  },
  {
    "title": "Dhaka Tech Mixer and Social (Tech / AI / Data / IT)",
    "description": "Join us at our TECH MIXER AND SOCIAL for afterwork drinks, networking with tech / IT workers in and connect with others in tech\r\n\r\nWhether you're a seasoned tech veteran or just starting out, let's create the ideal afterwork place to meet and chill with other workers in tech - find that new job, expand your network, share ideas, and stay up-to-date on the latest trends in the industry. Let's inspire, innovate, and shape the future of technology in Dhaka!\r\n\r\nTech, AI, Data, IT, and more ~",
    "date": "2026-07-07T09:00:00.000Z",
    "location": "Boomers CafeDhaka, Dhaka Division",
    "capacity": 100,
    "tags": [
      "Tech",
      "AI",
      "Data",
      "IT"
    ],
    "price": 9.99,
    "imageUrl": "/uploads/cb8efe23-5b1c-4529-a8fb-76ffa4d4fea0.png"
  },
  {
    "title": "The Shur Project",
    "description": "Shur Project is an intimate live music experience by House of Dhaka, created to celebrate the voices shaping Bangladesh's independent music scene. Bringing together 15 emerging and established musicians, this is a night dedicated to discovering new sounds, celebrating local talent, and creating unforgettable memories through live performances.\r\n\r\nExpect an evening filled with soulful vocals, acoustic performances, original music, and reimagined classics in a setting designed to make every performance feel personal.\r\n\r\nWhether you're a long-time supporter of the local music scene or simply looking for an unforgettable evening, Shur Project is where artists and audiences connect beyond the stage.",
    "date": "2026-10-30T09:00:00.000Z",
    "location": "Raaga Art Cafe, Uttara",
    "capacity": 250,
    "tags": [
      "Adda",
      "Gaan",
      "Shur",
      "Smriti"
    ],
    "price": 14.89,
    "imageUrl": "/uploads/810d426a-ba7a-47ba-a80a-422158ecff03.png"
  },
  {
    "title": "RoboFusion 1.0",
    "description": "ROBOFUSION 1.0 is a national platform that brings together students, innovators, engineers, researchers, makers and technology enthusiasts from across Bangladesh to celebrate innovation, creativity and engineering excellence. Through a series of competitions and technology showcases, participants will have the opportunity to demonstrate their technical expertise, collaborate with like-minded individuals and solve real-world engineering challenges.",
    "date": "2027-11-25T09:00:00.000Z",
    "location": "Kaliakair Hi-Tech Park, Kaliakair, Gazipur",
    "capacity": 491,
    "tags": [
      "Robot",
      "Boat",
      "Techathon",
      "LFO"
    ],
    "price": 19.98,
    "imageUrl": "/uploads/34f2a1df-c6b4-4301-9da7-a5a61c37ee42.png"
  },
  {
    "title": "AE BANGLADESH PRESENTS: ANIME FEST LIMITED REALM ",
    "description": "Designed to bring fans together under one roof, the event offers an exciting opportunity to connect with the community, showcase creativity, discover exclusive merchandise, and enjoy a full day of entertainment and unforgettable experiences.",
    "date": "2028-05-25T03:00:00.000Z",
    "location": "GULSHAN 1, CELEBRITY CONVENTION HALL, LEVEL 6",
    "capacity": 200,
    "tags": [
      "Anime",
      "Concert",
      "Fun"
    ],
    "price": 9.87,
    "imageUrl": "/uploads/7c6c4925-f8f8-4a6a-bbf0-24dba4698690.jpg"
  },
  {
    "title": "Core Splash",
    "description": "Core Splash is more than just a pool party, it's a complete summer experience designed to bring together music, entertainment, great people, and unforgettable memories. Whether you're coming to swim, dance, create content, or simply enjoy the atmosphere, there's something for everyone.",
    "date": "2028-05-25T03:00:00.000Z",
    "location": "CCULB RESORT PURBACHAL DHAKA",
    "capacity": 100,
    "tags": [
      "Stage Performance",
      "Swimming",
      "Buffet"
    ],
    "price": 9.84,
    "imageUrl": "/uploads/140b6089-728f-47ad-a36d-d6108462942b.png"
  },
  {
    "title": "Soul of Qawwali",
    "description": "Join us for a soulful cultural experience filled with music, aesthetics, warmth, and unforgettable memories.",
    "date": "2028-07-25T21:00:00.000Z",
    "location": "Tajine Banquet Hall",
    "capacity": 100,
    "tags": [
      "𝗟𝗶𝘃𝗲 𝗤𝗮𝘄𝘄𝗮𝗹𝗶",
      "𝗖𝗶𝗻𝗲𝗺𝗮𝘁𝗶𝗰 𝗔𝘁𝗺𝗼𝘀𝗽𝗵𝗲𝗿𝗲",
      "𝗙𝗿𝗮𝗴𝗿𝗮𝗻𝗰𝗲 & 𝗔𝗲𝘀𝘁𝗵𝗲𝘁𝗶𝗰𝘀"
    ],
    "price": 19.99,
    "imageUrl": "/uploads/eb1a783f-6398-4799-8333-eba137b5981e.png"
  },
  {
    "title": "Turkish Gala Fest",
    "description": "Step into the elegance and vibrant spirit of Türkiye at Turkish Gala Fest 2026, presented by Auréa Bangladesh. Join us for a three-day celebration of culture, lifestyle, food, live entertainment, and unforgettable experiences.\r\n\r\nFrom authentic Turkish flavors and cultural showcases to music, fashion, art, and interactive experiences — Turkish Gala Fest brings together the richness of Turkish heritage in a modern festive atmosphere.",
    "date": "2028-12-25T21:00:00.000Z",
    "location": "Aloki, Tejgaon",
    "capacity": 300,
    "tags": [
      "Live Show",
      "Food",
      "Asthetics"
    ],
    "price": 20,
    "imageUrl": "/uploads/fbc4a534-4ada-48de-b087-e2b621f016f3.jpeg"
  }
];
