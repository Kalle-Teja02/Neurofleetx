/**
 * Dijkstra's Shortest Path Algorithm
 * Finds the shortest path between two nodes in a weighted graph
 * 
 * @param {Object} graph - Graph structure with nodes and edges
 *   Example: {
 *     'Hyderabad': { 'Karimnagar': 120, 'Warangal': 160 },
 *     'Karimnagar': { 'Hyderabad': 120, 'Warangal': 80 },
 *     'Warangal': { 'Hyderabad': 160, 'Karimnagar': 80 }
 *   }
 * @param {string} start - Starting node
 * @param {string} end - Ending node
 * @returns {Array} Ordered array of nodes representing the shortest path
 */
export function dijkstra(graph, start, end) {
  // Validate inputs
  if (!graph || !start || !end) {
    console.error('❌ Dijkstra: Invalid inputs', { graph: !!graph, start, end });
    return null;
  }

  if (!graph[start] || !graph[end]) {
    console.error('❌ Dijkstra: Start or end node not in graph', { start, end });
    return null;
  }

  // Initialize distances and previous nodes
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  // Set all distances to infinity except start
  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  }
  distances[start] = 0;

  console.log('🔍 Dijkstra: Starting algorithm', { start, end });

  // Main algorithm loop
  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    // If no path exists
    if (current === null || distances[current] === Infinity) {
      console.warn('⚠️ Dijkstra: No path found between', start, 'and', end);
      return null;
    }

    // If we reached the end node, reconstruct path
    if (current === end) {
      const path = [];
      let node = end;
      while (node !== null) {
        path.unshift(node);
        node = previous[node];
      }
      console.log('✅ Dijkstra: Path found', path);
      console.log('📊 Dijkstra: Total distance:', distances[end]);
      return path;
    }

    unvisited.delete(current);

    // Update distances to neighbors
    if (graph[current]) {
      for (const neighbor in graph[current]) {
        if (unvisited.has(neighbor)) {
          const newDistance = distances[current] + graph[current][neighbor];
          if (newDistance < distances[neighbor]) {
            distances[neighbor] = newDistance;
            previous[neighbor] = current;
          }
        }
      }
    }
  }

  console.warn('⚠️ Dijkstra: No path found');
  return null;
}

/**
 * Find all intermediate nodes between start and end
 * Useful for multi-stop routing
 * 
 * @param {Object} graph - Graph structure
 * @param {string} start - Starting node
 * @param {string} end - Ending node
 * @returns {Array} Path including start and end
 */
export function findShortestPath(graph, start, end) {
  return dijkstra(graph, start, end);
}

/**
 * Calculate total distance of a path
 * 
 * @param {Object} graph - Graph structure
 * @param {Array} path - Array of nodes representing the path
 * @returns {number} Total distance
 */
export function calculatePathDistance(graph, path) {
  if (!path || path.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];
    if (graph[current] && graph[current][next]) {
      totalDistance += graph[current][next];
    }
  }
  return totalDistance;
}

/**
 * Get intermediate nodes (excluding start and end)
 * 
 * @param {Array} path - Full path array
 * @returns {Array} Intermediate nodes only
 */
export function getIntermediateNodes(path) {
  if (!path || path.length <= 2) return [];
  return path.slice(1, -1);
}
