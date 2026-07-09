import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./prisma/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function testReviewFlow() {
  console.log("🧪 Testing Review Flow\n");

  try {
    // 1. Find a RETURNED order
    const returnedOrder = await prisma.rentalOrder.findFirst({
      where: { status: "RETURNED" },
      include: {
        customer: true,
        rentalOrderItems: {
          include: {
            gearItem: true,
          },
        },
      },
    });

    if (!returnedOrder) {
      console.log("❌ No RETURNED order found");
      console.log("   Please complete a rental cycle first:");
      console.log("   1. Create order");
      console.log("   2. Pay for order");
      console.log("   3. Mark as PICKED_UP");
      console.log("   4. Mark as RETURNED\n");
      return;
    }

    console.log("✅ Found returned order:");
    console.log(`   Order ID: ${returnedOrder.id}`);
    console.log(`   Customer: ${returnedOrder.customer.name}`);
    console.log(`   Status: ${returnedOrder.status}`);
    console.log(`   Items: ${returnedOrder.rentalOrderItems.length}\n`);

    const firstItem = returnedOrder.rentalOrderItems[0];
    const gearItemId = firstItem.gearItemId;
    const customerId = returnedOrder.customerId;

    console.log("📝 Testing review creation:");
    console.log(`   Gear: ${firstItem.gearItem.name}`);
    console.log(`   Brand: ${firstItem.gearItem.brand}\n`);

    // 2. Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        customerId,
        gearItemId,
      },
    });

    if (existingReview) {
      console.log("⚠️  Review already exists for this gear");
      console.log(`   Review ID: ${existingReview.id}`);
      console.log(`   Rating: ${existingReview.rating}/5`);
      console.log(`   Comment: ${existingReview.comment}\n`);

      // Test update
      console.log("🔄 Testing review update...");
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: 5,
          comment: "Updated: Excellent gear! Highly recommended!",
        },
      });

      console.log("✅ Review updated:");
      console.log(`   New Rating: ${updatedReview.rating}/5`);
      console.log(`   New Comment: ${updatedReview.comment}\n`);
    } else {
      // 3. Create review
      console.log("✨ Creating new review...");
      const review = await prisma.review.create({
        data: {
          customerId,
          gearItemId,
          rating: 5,
          comment:
            "Excellent gear! Very high quality and exactly as described.",
        },
        include: {
          customer: {
            select: {
              name: true,
            },
          },
          gear: {
            select: {
              name: true,
              brand: true,
            },
          },
        },
      });

      console.log("✅ Review created successfully!");
      console.log(`   Review ID: ${review.id}`);
      console.log(`   Rating: ${review.rating}/5`);
      console.log(`   Comment: ${review.comment}`);
      console.log(`   Customer: ${review.customer.name}`);
      console.log(`   Gear: ${review.gear.name}\n`);
    }

    // 4. Get all reviews for this gear
    console.log("📊 Fetching all reviews for this gear...");
    const allReviews = await prisma.review.findMany({
      where: { gearItemId },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`✅ Found ${allReviews.length} review(s):`);
    allReviews.forEach((review, index) => {
      console.log(
        `   ${index + 1}. ${review.customer.name}: ${review.rating}/5`,
      );
      console.log(`      "${review.comment}"`);
    });

    // Calculate average rating
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating =
      allReviews.length > 0 ? totalRating / allReviews.length : 0;
    console.log(
      `\n   Average Rating: ${avgRating.toFixed(1)}/5 (${allReviews.length} reviews)\n`,
    );

    // 5. Get customer's all reviews
    console.log("📋 Fetching customer's all reviews...");
    const customerReviews = await prisma.review.findMany({
      where: { customerId },
      include: {
        gear: {
          select: {
            name: true,
            brand: true,
          },
        },
      },
    });

    console.log(`✅ Customer has ${customerReviews.length} review(s):`);
    customerReviews.forEach((review, index) => {
      console.log(
        `   ${index + 1}. ${review.gear.name} (${review.gear.brand})`,
      );
      console.log(`      Rating: ${review.rating}/5`);
      console.log(`      Comment: "${review.comment}"`);
    });

    console.log("\n🎉 Test completed successfully!");
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testReviewFlow();
