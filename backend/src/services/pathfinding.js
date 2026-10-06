import db from '../db/database.js';

/**
 * Calculates straight line distance in meters using Haversine formula (heuristic for A*)
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Computes cardinal compass direction between two coordinates
 */
export function getCompassDirection(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.cos((lon2 - lon1) * (Math.PI / 180));
  const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Finds shortest path between startId and endId using Dijkstra's Algorithm / A*
 */
export function findShortestPath(startId, endId, options = {}) {
  const startLoc = db.prepare('SELECT * FROM locations WHERE id = ?').get(startId);
  const endLoc = db.prepare('SELECT * FROM locations WHERE id = ?').get(endId);

  if (!startLoc || !endLoc) {
    throw new Error('Start or destination location not found.');
  }

  if (startId === endId) {
    return {
      found: true,
      totalDistanceMeters: 0,
      estimatedWalkingMinutes: 0,
      path: [startLoc],
      coordinates: [[startLoc.latitude, startLoc.longitude]],
      steps: [
        {
          stepNumber: 1,
          type: 'arrive',
          instruction: `You are already at ${startLoc.name} (${startLoc.building}, Floor ${startLoc.floor}).`,
          distanceMeters: 0,
          fromLocation: startLoc,
          toLocation: startLoc,
          floorChange: false
        }
      ]
    };
  }

  // Load all locations and edges into memory for quick graph traversal
  const allLocations = db.prepare('SELECT * FROM locations').all();
  const locMap = new Map(allLocations.map(l => [l.id, l]));

  const allEdges = db.prepare('SELECT * FROM routes').all();
  const adj = new Map();

  for (const loc of allLocations) {
    adj.set(loc.id, []);
  }

  for (const edge of allEdges) {
    if (adj.has(edge.from_location_id)) {
      adj.get(edge.from_location_id).push({
        to: edge.to_location_id,
        distance: edge.distance_meters,
        instructions: edge.instructions
      });
    }
  }

  // Priority Queue / Dijkstra Data Structures
  const distances = new Map();
  const previous = new Map();
  const visited = new Set();
  const edgeUsed = new Map();

  for (const loc of allLocations) {
    distances.set(loc.id, Infinity);
  }
  distances.set(startId, 0);

  // Simple min priority queue using array
  const queue = [{ id: startId, priority: 0 }];

  while (queue.length > 0) {
    // Sort by priority (f-score or distance)
    queue.sort((a, b) => a.priority - b.priority);
    const current = queue.shift();
    const currentId = current.id;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    if (currentId === endId) break;

    const neighbors = adj.get(currentId) || [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      const newDist = distances.get(currentId) + edge.distance;
      if (newDist < distances.get(edge.to)) {
        distances.set(edge.to, newDist);
        previous.set(edge.to, currentId);
        edgeUsed.set(edge.to, edge);

        // A* heuristic
        const targetNode = locMap.get(edge.to);
        const h = calculateHaversineDistance(
          targetNode.latitude,
          targetNode.longitude,
          endLoc.latitude,
          endLoc.longitude
        );

        queue.push({ id: edge.to, priority: newDist + h });
      }
    }
  }

  if (distances.get(endId) === Infinity) {
    return {
      found: false,
      message: 'No accessible path found between the selected locations.',
      startLocation: startLoc,
      endLocation: endLoc
    };
  }

  // Reconstruct path
  const pathIds = [];
  let curr = endId;
  while (curr !== undefined) {
    pathIds.unshift(curr);
    curr = previous.get(curr);
  }

  const pathLocations = pathIds.map(id => locMap.get(id));
  const coordinates = pathLocations.map(l => [l.latitude, l.longitude]);
  const totalDist = distances.get(endId);
  const walkingSpeedMetersPerMin = 75; // Approx 4.5 km/h
  const estimatedWalkingMinutes = Math.max(1, Math.ceil(totalDist / walkingSpeedMetersPerMin));

  // Build step-by-step turn guidance
  const steps = [];

  // Step 0: Departure step
  steps.push({
    stepNumber: 1,
    type: 'depart',
    instruction: `Depart from ${startLoc.name} (${startLoc.building}, Floor ${startLoc.floor}).`,
    distanceMeters: 0,
    fromLocation: startLoc,
    toLocation: startLoc,
    floorChange: false
  });

  for (let i = 0; i < pathLocations.length - 1; i++) {
    const from = pathLocations[i];
    const to = pathLocations[i + 1];
    const edge = edgeUsed.get(to.id);
    const dist = edge ? edge.distance : calculateHaversineDistance(from.latitude, from.longitude, to.latitude, to.longitude);

    let instruction = edge?.instructions;
    const sameBuilding = from.building === to.building;
    const floorDiff = to.floor - from.floor;

    let actionType = 'walk';
    let floorChangeText = '';

    if (sameBuilding && floorDiff !== 0) {
      actionType = floorDiff > 0 ? 'stairs_up' : 'stairs_down';
      floorChangeText = `Take stairs or elevator from Floor ${from.floor} to Floor ${to.floor}.`;
    }

    if (!instruction) {
      const direction = getCompassDirection(from.latitude, from.longitude, to.latitude, to.longitude);
      instruction = `Walk ${direction} toward ${to.name}. (${Math.round(dist)}m)`;
    }

    steps.push({
      stepNumber: steps.length + 1,
      type: actionType,
      instruction: instruction,
      additionalNote: floorChangeText,
      distanceMeters: Math.round(dist),
      fromLocation: from,
      toLocation: to,
      floorChange: floorDiff !== 0,
      buildingTransition: !sameBuilding
    });
  }

  // Arrival step
  steps.push({
    stepNumber: steps.length + 1,
    type: 'arrive',
    instruction: `Arrive at your destination: ${endLoc.name} (${endLoc.building}, Floor ${endLoc.floor}).`,
    distanceMeters: 0,
    fromLocation: endLoc,
    toLocation: endLoc,
    floorChange: false
  });

  return {
    found: true,
    totalDistanceMeters: Math.round(totalDist),
    estimatedWalkingMinutes,
    path: pathLocations,
    coordinates,
    steps,
    startLocation: startLoc,
    endLocation: endLoc
  };
}
