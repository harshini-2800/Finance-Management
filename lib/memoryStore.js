// In-memory persistent demo store for users when MongoDB_URI is not provided yet.
// Matches Mongoose schema and behaviors so users can evaluate the full app out-of-the-box.

if (!global.__aurum_memory_store) {
  global.__aurum_memory_store = {
    users: [],
    transactions: [],
    budgets: [],
    goals: [],
    chatMessages: [],
  };
}

export const memoryStore = global.__aurum_memory_store;

export function generateId() {
  return "mem_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

