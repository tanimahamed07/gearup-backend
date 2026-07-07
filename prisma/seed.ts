import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Camping" },
      update: {},
      create: { name: "Camping" },
    }),
    prisma.category.upsert({
      where: { name: "Climbing" },
      update: {},
      create: { name: "Climbing" },
    }),
    prisma.category.upsert({
      where: { name: "Hiking" },
      update: {},
      create: { name: "Hiking" },
    }),
    prisma.category.upsert({
      where: { name: "Water Sports" },
      update: {},
      create: { name: "Water Sports" },
    }),
    prisma.category.upsert({
      where: { name: "Winter Sports" },
      update: {},
      create: { name: "Winter Sports" },
    }),
  ]);

  console.log("✅ Categories created");

  // Create provider user
  const provider = await prisma.user.upsert({
    where: { email: "provider@gearup.com" },
    update: {},
    create: {
      name: "GearUp Provider",
      email: "provider@gearup.com",
      password: "$2a$10$XxqjQvZ1h6E0hNxSfKpP2.YGH5PJ9OKQvK5W8F5X3JVQX5X5X5X5X", // bcrypt hash of "password123"
      role: "PROVIDER",
      status: "ACTIVE",
      phone: "+8801712345678",
    },
  });

  console.log("✅ Provider user created");

  // Create 10 dummy gear items
  const gearItems = [
    {
      name: "Professional Camping Tent - 4 Person",
      brand: "Coleman",
      description:
        "Spacious 4-person camping tent with weatherproof design. Perfect for family camping trips. Features easy setup, waterproof rainfly, and excellent ventilation.",
      pricePerDay: 25.0,
      stock: 5,
      categoryId: categories[0].id, // Camping
    },
    {
      name: "Climbing Rope 60m Dynamic",
      brand: "Petzl",
      description:
        "High-quality 60-meter dynamic climbing rope. UIAA certified, diameter 9.8mm. Ideal for sport climbing and multi-pitch routes.",
      pricePerDay: 15.0,
      stock: 8,
      categoryId: categories[1].id, // Climbing
    },
    {
      name: "Hiking Backpack 65L",
      brand: "Osprey",
      description:
        "Comfortable 65-liter hiking backpack with adjustable harness. Features multiple compartments, rain cover, and hydration system compatibility.",
      pricePerDay: 12.0,
      stock: 10,
      categoryId: categories[2].id, // Hiking
    },
    {
      name: "Inflatable Kayak - 2 Person",
      brand: "Intex",
      description:
        "Durable inflatable kayak for 2 persons. Includes paddles, pump, and repair kit. Perfect for lakes and calm rivers.",
      pricePerDay: 35.0,
      stock: 4,
      categoryId: categories[3].id, // Water Sports
    },
    {
      name: "Ski Set with Boots",
      brand: "Rossignol",
      description:
        "Complete ski set including skis, bindings, poles, and boots. Suitable for intermediate to advanced skiers. Multiple sizes available.",
      pricePerDay: 45.0,
      stock: 6,
      categoryId: categories[4].id, // Winter Sports
    },
    {
      name: "Portable Camping Stove",
      brand: "MSR",
      description:
        "Compact and lightweight camping stove. Burns efficiently with propane or butane. Includes carrying case and windscreen.",
      pricePerDay: 8.0,
      stock: 12,
      categoryId: categories[0].id, // Camping
    },
    {
      name: "Rock Climbing Harness",
      brand: "Black Diamond",
      description:
        "Comfortable and durable climbing harness. Four gear loops, padded waist belt and leg loops. Suitable for all-day climbing sessions.",
      pricePerDay: 10.0,
      stock: 15,
      categoryId: categories[1].id, // Climbing
    },
    {
      name: "Trekking Poles - Pair",
      brand: "Leki",
      description:
        "Lightweight aluminum trekking poles with adjustable height. Anti-shock system and ergonomic grips. Includes various tip options.",
      pricePerDay: 6.0,
      stock: 20,
      categoryId: categories[2].id, // Hiking
    },
    {
      name: "Stand Up Paddleboard (SUP)",
      brand: "Red Paddle Co",
      description:
        "Inflatable stand up paddleboard with pump and paddle. Stable design perfect for beginners. Easy to transport and store.",
      pricePerDay: 30.0,
      stock: 7,
      categoryId: categories[3].id, // Water Sports
    },
    {
      name: "Snowboard with Bindings",
      brand: "Burton",
      description:
        "All-mountain snowboard with responsive bindings. Suitable for intermediate riders. Great for both groomed runs and powder.",
      pricePerDay: 40.0,
      stock: 5,
      categoryId: categories[4].id, // Winter Sports
    },
  ];

  for (const item of gearItems) {
    await prisma.gearItem.create({
      data: {
        ...item,
        providerId: provider.id,
        isAvailable: true,
      },
    });
  }

  console.log("✅ 10 gear items created successfully");
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
