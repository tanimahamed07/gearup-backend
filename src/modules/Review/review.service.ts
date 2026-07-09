import { prisma } from "../../lib/prisma";
import { CreateReviewPayload } from "./review.interface";


const createReview = async (
  customerId: string,
  payload: CreateReviewPayload,
) => {
  const { gearItemId, rating, comment } = payload;

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Check if customer has rented this gear and returned it
  const hasRentedAndReturned = await prisma.rentalOrder.findFirst({
    where: {
      customerId,
      status: "RETURNED",
      rentalOrderItems: {
        some: {
          gearItemId,
        },
      },
    },
  });

  if (!hasRentedAndReturned) {
    throw new Error("You can only review items you have rented and returned");
  }

  // Check if customer already reviewed this gear
  const existingReview = await prisma.review.findFirst({
    where: {
      customerId,
      gearItemId,
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this item");
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      customerId,
      gearItemId,
      rating,
      comment,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gear: {
        select: {
          id: true,
          name: true,
          brand: true,
        },
      },
    },
  });

  return review;
};

const getGearReviews = async (gearItemId: string) => {
  const reviews = await prisma.review.findMany({
    where: { gearItemId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  return {
    reviews,
    totalReviews: reviews.length,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
  };
};

const getMyReviews = async (customerId: string) => {
  return await prisma.review.findMany({
    where: { customerId },
    include: {
      gear: {
        select: {
          id: true,
          name: true,
          brand: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const updateReview = async (
  reviewId: string,
  customerId: string,
  payload: Partial<CreateReviewPayload>,
) => {
  // Check if review exists and belongs to customer
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      customerId,
    },
  });

  if (!review) {
    throw new Error(
      "Review not found or you don't have permission to update it",
    );
  }

  // Validate rating if provided
  if (payload.rating && (payload.rating < 1 || payload.rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }

  return await prisma.review.update({
    where: { id: reviewId },
    data: payload,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
      gear: {
        select: {
          id: true,
          name: true,
          brand: true,
        },
      },
    },
  });
};

const deleteReview = async (reviewId: string, customerId: string) => {
  // Check if review exists and belongs to customer
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      customerId,
    },
  });

  if (!review) {
    throw new Error(
      "Review not found or you don't have permission to delete it",
    );
  }

  return await prisma.review.delete({
    where: { id: reviewId },
  });
};

export const reviewService = {
  createReview,
  getGearReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
