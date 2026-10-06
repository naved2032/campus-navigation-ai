import express from 'express';
import db from '../db/database.js';
import { calculateHaversineDistance } from '../services/pathfinding.js';

const router = express.Router();

/**
 * GET /api/locations
 * Supports query parameters:
 *  - category: Filter by category (Labs, Departments, Offices, Classrooms, Facilities)
 *  - search: Search text for name, building, or description
 *  - floor: Filter by floor
 */
router.get('/', (req, res) => {
  try {
    const { category, search, floor } = req.query;
    let query = 'SELECT * FROM locations WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (floor) {
      query += ' AND floor = ?';
      params.push(Number(floor));
    }

    if (search && search.trim() !== '') {
      query += ' AND (name LIKE ? OR building LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY name ASC';

    const locations = db.prepare(query).all(...params);
    res.json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/locations/categories
 * Get summary of categories with counts
 */
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM locations 
      GROUP BY category 
      ORDER BY count DESC
    `).all();

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/locations/:id
 * Get single location with direct connected edges/neighbors
 */
router.get('/:id', (req, res) => {
  try {
    const locationId = Number(req.params.id);
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(locationId);

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    // Get connected neighbors
    const neighbors = db.prepare(`
      SELECT r.id as route_id, r.distance_meters, r.instructions,
             l.id, l.name, l.category, l.building, l.floor, l.latitude, l.longitude
      FROM routes r
      JOIN locations l ON r.to_location_id = l.id
      WHERE r.from_location_id = ?
    `).all(locationId);

    res.json({
      success: true,
      data: {
        ...location,
        connectedLocations: neighbors
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/locations
 * Admin endpoint to add a new campus location.
 * Optionally connects to the closest existing location automatically if connectToNearest is true.
 */
router.post('/', (req, res) => {
  try {
    const { name, category, building, floor, latitude, longitude, description, connectToId } = req.body;

    if (!name || !category || !building || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, building, latitude, and longitude.'
      });
    }

    const validCategories = ['Labs', 'Departments', 'Offices', 'Classrooms', 'Facilities'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    const insertStmt = db.prepare(`
      INSERT INTO locations (name, category, building, floor, latitude, longitude, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      name.trim(),
      category,
      building.trim(),
      Number(floor) || 1,
      Number(latitude),
      Number(longitude),
      description ? description.trim() : ''
    );

    const newLocationId = result.lastInsertRowid;

    // Connect to specific location or nearest location to ensure graph connectivity
    const allOtherLocations = db.prepare('SELECT * FROM locations WHERE id != ?').all(newLocationId);
    
    let targetConnectId = connectToId ? Number(connectToId) : null;
    
    if (!targetConnectId && allOtherLocations.length > 0) {
      // Find nearest location by distance
      let minDist = Infinity;
      let nearestLoc = null;

      for (const loc of allOtherLocations) {
        const d = calculateHaversineDistance(latitude, longitude, loc.latitude, loc.longitude);
        if (d < minDist) {
          minDist = d;
          nearestLoc = loc;
        }
      }
      if (nearestLoc) {
        targetConnectId = nearestLoc.id;
      }
    }

    if (targetConnectId) {
      const targetLoc = db.prepare('SELECT * FROM locations WHERE id = ?').get(targetConnectId);
      if (targetLoc) {
        const dist = Math.round(calculateHaversineDistance(latitude, longitude, targetLoc.latitude, targetLoc.longitude));
        const insertRoute = db.prepare(`
          INSERT INTO routes (from_location_id, to_location_id, distance_meters, instructions)
          VALUES (?, ?, ?, ?)
        `);

        insertRoute.run(
          newLocationId,
          targetLoc.id,
          dist,
          `Walk along the connecting walkway from ${name} toward ${targetLoc.name}.`
        );

        insertRoute.run(
          targetLoc.id,
          newLocationId,
          dist,
          `Walk along the connecting walkway from ${targetLoc.name} toward ${name}.`
        );
      }
    }

    const createdLocation = db.prepare('SELECT * FROM locations WHERE id = ?').get(newLocationId);

    res.status(201).json({
      success: true,
      message: 'Campus location added and connected to the navigation graph.',
      data: createdLocation
    });
  } catch (error) {
    console.error('Error adding location:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/locations/:id
 * Admin endpoint to delete a location
 */
router.delete('/:id', (req, res) => {
  try {
    const locationId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM locations WHERE id = ?').get(locationId);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    // SQLite foreign keys will cascade delete routes
    db.prepare('DELETE FROM locations WHERE id = ?').run(locationId);

    res.json({
      success: true,
      message: `Location '${existing.name}' deleted successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
