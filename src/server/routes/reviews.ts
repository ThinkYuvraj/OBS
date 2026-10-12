import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { AppReview } from '../../types/sports';

const router = Router();

// GET /api/reviews - Fetch all reviews and Google Play Store stats
router.get('/', (req: Request, res: Response) => {
  const sport = req.query.sport as string | undefined;
  const reviews = storage.getReviews(sport);
  const stats = storage.getReviewStats();

  return res.json({
    reviews,
    stats,
    googlePlayPackage: 'com.marketinglu.obs.scorebug',
    googlePlayDirectRateUrl: 'https://play.google.com/store/apps/details?id=com.marketinglu.obs.scorebug&showAllReviews=true',
  });
});

// POST /api/reviews - Submit a new review
router.post('/', (req: Request, res: Response) => {
  const {
    authorName,
    organization,
    role,
    sport,
    rating,
    title,
    reviewText,
    easeOfUseRating,
    overlayPerformanceRating,
    featuresLiked,
    isVerifiedBroadcaster,
    playStoreSubmitted,
  } = req.body;

  if (!authorName || !rating || !reviewText) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Author name, star rating (1-5), and review text are required.',
    });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({
      error: 'Invalid rating',
      message: 'Rating must be an integer between 1 and 5.',
    });
  }

  const review = storage.addReview({
    authorName: authorName.trim(),
    organization: organization ? organization.trim() : undefined,
    role: role || 'Streamer',
    sport: sport || 'all',
    rating: numRating,
    title: title ? title.trim() : `${numRating}-Star Review`,
    reviewText: reviewText.trim(),
    easeOfUseRating: easeOfUseRating ? Number(easeOfUseRating) : numRating,
    overlayPerformanceRating: overlayPerformanceRating ? Number(overlayPerformanceRating) : numRating,
    featuresLiked: Array.isArray(featuresLiked) ? featuresLiked : [],
    isVerifiedBroadcaster: Boolean(isVerifiedBroadcaster),
    playStoreSubmitted: Boolean(playStoreSubmitted),
  });

  return res.status(201).json({
    success: true,
    review,
    stats: storage.getReviewStats(),
    message: 'Thank you for reviewing MarketinGlu OBS! Your review has been published.',
  });
});

export default router;
