import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "./db.js";

async function main() {
  console.log("Seeding Harmonia demo data...");
  const password = await bcrypt.hash("password", 10);

  const users = [
    {
      username: "alex_guitar",
      email: "alex@example.com",
      displayName: "Alex Cohen",
      accountType: "musician",
      bio: "Guitarist looking for collabs. Funk, jazz, neo-soul.",
      location: "Tel Aviv",
      instruments: ["guitar", "bass"],
      genres: ["funk", "jazz"],
    },
    {
      username: "noa_producer",
      email: "noa@example.com",
      displayName: "Noa Levi",
      accountType: "producer",
      bio: "Producer & sound engineer. Home studio in Florentin.",
      location: "Tel Aviv",
      instruments: ["keys", "synths"],
      genres: ["lofi", "electronic"],
    },
    {
      username: "ravid_sax",
      email: "ravid@example.com",
      displayName: "Ravid Sax",
      accountType: "musician",
      bio: "Saxophone player, session work welcome.",
      location: "Haifa",
      instruments: ["saxophone"],
      genres: ["jazz", "soul"],
    },
    {
      username: "miri_teacher",
      email: "miri@example.com",
      displayName: "Miri Shalom",
      accountType: "teacher",
      bio: "Piano teacher, classical & jazz, 12+ years experience.",
      location: "Jerusalem",
      instruments: ["piano"],
      genres: ["classical", "jazz"],
    },
    {
      username: "stringsmith",
      email: "shop@example.com",
      displayName: "StringSmith Music Shop",
      accountType: "business",
      bio: "Guitars, basses, repair work. Walk-ins welcome.",
      location: "Tel Aviv",
      instruments: [],
      genres: [],
    },
    {
      username: "fan_listener",
      email: "fan@example.com",
      displayName: "Music Fan",
      accountType: "listener",
      bio: "Just here for the playlists.",
      location: "Beer Sheva",
      instruments: [],
      genres: ["indie", "rock"],
    },
  ].map((u) => ({
    id: nanoid(),
    passwordHash: password,
    avatarUrl: null,
    isPrivate: false,
    spotifyConnected: false,
    createdAt: Date.now(),
    ...u,
  }));

  const teacherUser = users.find((u) => u.username === "miri_teacher");
  const teacherProfiles = [
    {
      id: nanoid(),
      userId: teacherUser.id,
      headline: "Classical & jazz piano — patient, structured, fun",
      bio: "Berklee grad. Teaches kids and adults. Recital prep available.",
      instruments: ["piano"],
      city: "Jerusalem",
      country: "Israel",
      pricePerHour: 180,
      languages: ["Hebrew", "English"],
      online: true,
      inPerson: true,
      createdAt: Date.now(),
    },
  ];

  const reviews = [
    {
      id: nanoid(),
      teacherId: teacherProfiles[0].id,
      userId: users[0].id,
      rating: 5,
      text: "Helped my daughter prep for her recital — best teacher we've had.",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    },
    {
      id: nanoid(),
      teacherId: teacherProfiles[0].id,
      userId: users[5].id,
      rating: 4,
      text: "Friendly and knowledgeable. Online lessons worked great.",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    },
  ];

  const questions = [
    {
      id: nanoid(),
      userId: users[0].id,
      title: "How do I voice-lead a ii-V-I cleanly on guitar?",
      body: "I keep jumping between shapes. Any tips for smoother voice leading?",
      tags: ["guitar", "theory", "jazz"],
      createdAt: Date.now() - 1000 * 60 * 60 * 5,
    },
    {
      id: nanoid(),
      userId: users[1].id,
      title: "My amp won't turn on — fuse?",
      body: "Fender Hot Rod Deluxe, no power LED. Replaced the IEC cable already.",
      tags: ["amp", "repair"],
      createdAt: Date.now() - 1000 * 60 * 60 * 30,
    },
  ];

  const answers = [
    {
      id: nanoid(),
      questionId: questions[0].id,
      userId: users[2].id,
      text: "Stay on the same string set. Move the 3rd of the V down a half-step into the 7th of the I.",
      upvotes: 3,
      upvoters: [users[0].id, users[1].id, users[5].id],
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
    },
    {
      id: nanoid(),
      questionId: questions[1].id,
      userId: users[4].id,
      text: "Check the rear-panel mains fuse first — most common failure on those.",
      upvotes: 5,
      upvoters: [users[0].id, users[1].id, users[2].id, users[3].id, users[5].id],
      createdAt: Date.now() - 1000 * 60 * 60 * 28,
    },
  ];

  const listings = [
    {
      id: nanoid(),
      userId: users[4].id,
      title: "Fender Telecaster MIM (2018) — used",
      description: "Great condition, fresh setup, comes with hardshell case.",
      category: "guitar",
      mode: "sale",
      price: 2400,
      currency: "ILS",
      condition: "used",
      location: "Tel Aviv",
      forTrade: "",
      photos: [],
      sold: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 50,
    },
    {
      id: nanoid(),
      userId: users[1].id,
      title: "Shure SM7B for rent — weekend rate",
      description: "Rent for a weekend session. Cable included.",
      category: "microphone",
      mode: "rent",
      price: 120,
      currency: "ILS",
      condition: "like_new",
      location: "Tel Aviv",
      forTrade: "",
      photos: [],
      sold: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
    },
    {
      id: nanoid(),
      userId: users[0].id,
      title: "Trade: vintage Boss DD-3 for any reverb pedal",
      description: "Open to trades. Working perfectly.",
      category: "pedal",
      mode: "trade",
      price: 0,
      currency: "ILS",
      condition: "used",
      location: "Tel Aviv",
      forTrade: "Reverb pedal — Strymon, Boss, EHX",
      photos: [],
      sold: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 80,
    },
  ];

  const playlists = [
    {
      id: nanoid(),
      userId: users[0].id,
      title: "Practice loop",
      description: "Tracks I'm shedding to.",
      spotifyId: "37i9dQZF1DXcBWIGoYBM5M",
      spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
      coverUrl: null,
      tracks: [],
      createdAt: Date.now(),
    },
  ];

  const posts = [
    {
      id: nanoid(),
      userId: users[0].id,
      mediaUrl: null,
      mediaType: "image",
      caption: "Late night shed session 🎸 (placeholder post)",
      tags: ["guitar"],
      createdAt: Date.now() - 1000 * 60 * 30,
    },
    {
      id: nanoid(),
      userId: users[1].id,
      mediaUrl: null,
      mediaType: "image",
      caption: "Mixing today's session — soft sat on the bus.",
      tags: ["studio", "mixing"],
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
    },
  ];

  const collabs = [
    {
      id: nanoid(),
      userId: users[0].id,
      title: "Need sax solo on neo-soul beat",
      description:
        "32-bar form, looking for an alto or tenor sax solo on the bridge.",
      mode: "open",
      lookingFor: ["saxophone"],
      bpm: 84,
      key: "Dm",
      genre: "neo-soul",
      licenseNote: "50/50 split if released.",
      baseTrackUrl: null,
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
    },
    {
      id: nanoid(),
      userId: users[1].id,
      title: "Looking for guitar solo (lo-fi/funk)",
      description: "Looking for a tasty 8-bar guitar solo over the C section.",
      mode: "invite",
      lookingFor: ["guitar"],
      bpm: 92,
      key: "Bbm",
      genre: "lofi",
      licenseNote: "Credit + 30% of streaming revenue.",
      baseTrackUrl: null,
      createdAt: Date.now() - 1000 * 60 * 60 * 26,
    },
  ];

  db.reset({
    users,
    teacherProfiles,
    reviews,
    questions,
    answers,
    listings,
    playlists,
    posts,
    collabs,
  });

  console.log("Seeded.");
  console.log("Login as any user with password: password");
  for (const u of users) console.log("  -", u.username, "(", u.accountType, ")");
}

main();
