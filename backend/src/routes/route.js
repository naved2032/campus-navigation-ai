import express from 'express';
import db from '../db/database.js';
import { findShortestPath } from '../services/pathfinding.js';
import { seedDatabase } from '../db/seed.js';

const router = express.Router();

/**
 * POST /api/route
 * Body: { startId: number, endId: number }
 * Computes shortest path and navigation directions
 */
router.post('/', (req, res) => {
  try {
    const { startId, endId } = req.body;

    if (!startId || !endId) {
      return res.status(400).json({
        success: false,
        message: 'Both startId and endId are required.'
      });
    }

    const numStart = Number(startId);
    const numEnd = Number(endId);

    const result = findShortestPath(numStart, numEnd);

    if (!result.found) {
      return res.status(404).json({
        success: false,
        message: result.message || 'No viable route found between these locations.',
        data: result
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error calculating route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while computing route.'
    });
  }
});

/**
 * GET /api/route/edges
 * Returns all network segments for drawing full campus pathway network
 */
router.get('/edges', (req, res) => {
  try {
    const edges = db.prepare(`
      SELECT r.id, r.from_location_id, r.to_location_id, r.distance_meters, r.instructions,
             l1.name as from_name, l1.latitude as from_lat, l1.longitude as from_lng,
             l2.name as to_name, l2.latitude as to_lat, l2.longitude as to_lng
      FROM routes r
      JOIN locations l1 ON r.from_location_id = l1.id
      JOIN locations l2 ON r.to_location_id = l2.id
    `).all();

    res.json({ success: true, count: edges.length, data: edges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/route/reset-seed
 * Restores initial demo dataset for flawless hackathon presentations
 */
router.post('/reset-seed', (req, res) => {
  try {
    seedDatabase(true);
    res.json({ success: true, message: 'Campus dataset reset to factory seed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
