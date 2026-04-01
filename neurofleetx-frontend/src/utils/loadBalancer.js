/**
 * Load Balancing Score Model
 * score = (distance_weight * normDist) + (time_weight * normTime) + (traffic_weight * normTraffic)
 * Lower score = better route
 */

const WEIGHTS = { distance: 0.3, time: 0.4, traffic: 0.3 };

/**
 * Assign a simulated traffic level (1-10) based on route type.
 * In a real system this would come from a traffic API.
 */
function simulateTraffic(routeType) {
  const base = { fastest: 3, alternate: 5, traffic: 9 };
  const jitter = Math.floor(Math.random() * 2); // ±1
  return (base[routeType] ?? 5) + jitter;
}

/**
 * Normalize an array of values to [0, 1] range.
 * Returns 0 for all values if min === max (avoid division by zero).
 */
function normalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0);
  return values.map(v => (v - min) / (max - min));
}

/**
 * Score all routes and mark the best one.
 * @param {Array} routes - existing route objects with distance, duration, type
 * @returns {Array} routes enriched with traffic, score, isBest
 */
export function scoreRoutes(routes) {
  if (!routes || routes.length === 0) return routes;

  // Attach traffic values
  const withTraffic = routes.map(r => ({
    ...r,
    traffic: simulateTraffic(r.type),
  }));

  const distances = withTraffic.map(r => parseFloat(r.distance) || 0);
  const times     = withTraffic.map(r => r.duration || 0);
  const traffics  = withTraffic.map(r => r.traffic);

  const normDist    = normalize(distances);
  const normTime    = normalize(times);
  const normTraffic = normalize(traffics);

  const scored = withTraffic.map((r, i) => ({
    ...r,
    score: parseFloat(
      (WEIGHTS.distance * normDist[i] +
       WEIGHTS.time     * normTime[i] +
       WEIGHTS.traffic  * normTraffic[i]).toFixed(3)
    ),
  }));

  // Lowest score wins
  const minScore = Math.min(...scored.map(r => r.score));
  return scored.map(r => ({ ...r, isBest: r.score === minScore }));
}

/**
 * Return traffic label from numeric value
 */
export function trafficLabel(value) {
  if (value <= 3) return 'Low';
  if (value <= 6) return 'Moderate';
  return 'High';
}
