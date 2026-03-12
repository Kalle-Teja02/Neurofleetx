// Dijkstra Algorithm Implementation for Route Optimization

class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }

  dequeue() {
    return this.values.shift();
  }

  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }

  isEmpty() {
    return this.values.length === 0;
  }
}

/**
 * Dijkstra's Algorithm for finding shortest path
 * @param {Object} graph - Road network graph
 * @param {String} startNode - Starting node
 * @param {String} endNode - Destination node
 * @returns {Object} - Path, distance, and ETA
 */
export function calculateShortestPath(graph, startNode, endNode) {
  const distances = {};
  const previous = {};
  const pq = new PriorityQueue();
  const path = [];

  // Initialize distances
  for (let node in graph) {
    if (node === startNode) {
      distances[node] = 0;
      pq.enqueue(node, 0);
    } else {
      distances[node] = Infinity;
      pq.enqueue(node, Infinity);
    }
    previous[node] = null;
  }

  // Main Dijkstra loop
  while (!pq.isEmpty()) {
    let current = pq.dequeue().val;

    if (current === endNode) {
      // Build path
      while (previous[current]) {
        path.push(current);
        current = previous[current];
      }
      path.push(startNode);
      path.reverse();

      const distance = distances[endNode];
      const eta = calculateETA(distance);

      return {
        path,
        distance: distance.toFixed(1),
        eta,
        success: true
      };
    }

    if (current && graph[current]) {
      for (let neighbor in graph[current]) {
        let alt = distances[current] + graph[current][neighbor];
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = current;
          pq.enqueue(neighbor, alt);
        }
      }
    }
  }

  return {
    path: [],
    distance: 0,
    eta: "N/A",
    success: false
  };
}

/**
 * Calculate ETA based on distance
 * Assumes average speed of 30 km/h
 */
function calculateETA(distance) {
  const avgSpeed = 30; // km/h
  const timeInHours = distance / avgSpeed;
  const timeInMinutes = Math.round(timeInHours * 60);
  
  if (timeInMinutes < 60) {
    return `${timeInMinutes} mins`;
  } else {
    const hours = Math.floor(timeInMinutes / 60);
    const mins = timeInMinutes % 60;
    return `${hours}h ${mins}m`;
  }
}

/**
 * Find all possible paths (for alternate routes)
 * Uses modified Dijkstra to find k-shortest paths
 */
export function findAlternatePaths(graph, startNode, endNode, k = 3) {
  const paths = [];
  
  // Find shortest path
  const shortest = calculateShortestPath(graph, startNode, endNode);
  if (shortest.success) {
    paths.push({
      ...shortest,
      type: 'fastest',
      color: '#3b82f6' // blue
    });
  }

  // Simulate alternate paths by adding penalties to edges
  // Path 2: Moderate route
  const moderateGraph = JSON.parse(JSON.stringify(graph));
  addTrafficPenalty(moderateGraph, 1.2);
  const moderate = calculateShortestPath(moderateGraph, startNode, endNode);
  if (moderate.success && moderate.path.join() !== shortest.path.join()) {
    paths.push({
      ...moderate,
      type: 'alternate',
      color: '#10b981' // green
    });
  }

  // Path 3: High traffic route
  const trafficGraph = JSON.parse(JSON.stringify(graph));
  addTrafficPenalty(trafficGraph, 1.5);
  const traffic = calculateShortestPath(trafficGraph, startNode, endNode);
  if (traffic.success && traffic.path.join() !== shortest.path.join() && traffic.path.join() !== moderate.path.join()) {
    paths.push({
      ...traffic,
      type: 'traffic',
      color: '#ef4444' // red
    });
  }

  return paths;
}

/**
 * Add traffic penalty to graph edges
 */
function addTrafficPenalty(graph, multiplier) {
  for (let node in graph) {
    for (let neighbor in graph[node]) {
      graph[node][neighbor] *= multiplier;
    }
  }
}

/**
 * Convert graph nodes to map coordinates
 * Maps abstract nodes to real lat/lng coordinates
 */
export function nodeToCoordinates(node, coordinateMap) {
  return coordinateMap[node] || null;
}

/**
 * Convert path nodes to coordinate array for Polyline
 */
export function pathToCoordinates(path, coordinateMap) {
  return path.map(node => {
    const coord = coordinateMap[node];
    return coord ? [coord.lat, coord.lng] : null;
  }).filter(coord => coord !== null);
}
