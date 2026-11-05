import { connectDB } from "./mongodb";
import User from "./models/User";
import Transaction from "./models/Transaction";
import Budget from "./models/Budget";
import Goal from "./models/Goal";
import { memoryStore, generateId } from "./memoryStore";

export async function seedDemoDataForUser(userId) {
  const conn = await connectDB();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const now = new Date();

  // Helper date generators for past 3 months
  const daysAgo = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  const sampleTransactions = [
    // Month 1 (Current)
    { type: "income", amount: 75000, category: "Salary", description: "Monthly Tech Salary Direct Deposit", date: daysAgo(3), source: "manual", isRecurring: true },
    { type: "income", amount: 8500, category: "Freelance", description: "UI Design Consulting Project", date: daysAgo(9), source: "manual", isRecurring: false },
    { type: "expense", amount: 22000, category: "Housing", description: "Apartment Rent & Society Maintenance", date: daysAgo(5), source: "manual", isRecurring: true },
    { type: "expense", amount: 4500, category: "Groceries", description: "Nature's Basket Organic Weekly Stock", date: daysAgo(2), source: "manual", isRecurring: false },
    { type: "expense", amount: 1499, category: "Subscriptions", description: "Netflix 4K UHD & Spotify Family Plan", date: daysAgo(7), source: "manual", isRecurring: true },
    { type: "expense", amount: 1200, category: "Utilities", description: "Fiber Internet 300Mbps Bill", date: daysAgo(11), source: "manual", isRecurring: true },
    { type: "expense", amount: 2800, category: "Dining", description: "Artisan Coffee Roasters & Weekend Brunch", date: daysAgo(4), source: "manual", isRecurring: false },
    { type: "expense", amount: 1850, category: "Transport", description: "Uber Rides & Fuel", date: daysAgo(6), source: "ai", isRecurring: false },
    { type: "expense", amount: 6500, category: "Shopping", description: "Sony Noise Cancelling Headphones", date: daysAgo(12), source: "ai", isRecurring: false },
    { type: "expense", amount: 999, category: "Subscriptions", description: "GitHub Copilot + Cursor Pro", date: daysAgo(14), source: "manual", isRecurring: true },

    // Month 2 (-1 month)
    { type: "income", amount: 75000, category: "Salary", description: "Monthly Tech Salary", date: daysAgo(34), source: "manual", isRecurring: true },
    { type: "income", amount: 12000, category: "Investments", description: "Mutual Fund Dividend Payout", date: daysAgo(40), source: "manual", isRecurring: false },
    { type: "expense", amount: 22000, category: "Housing", description: "Monthly Apartment Rent", date: daysAgo(35), source: "manual", isRecurring: true },
    { type: "expense", amount: 5600, category: "Groceries", description: "Supermarket Household Restock", date: daysAgo(37), source: "manual", isRecurring: false },
    { type: "expense", amount: 2499, category: "Subscriptions", description: "Digital Subscriptions Bundle", date: daysAgo(38), source: "manual", isRecurring: true },
    { type: "expense", amount: 3900, category: "Dining", description: "Family Dinner at Bistro", date: daysAgo(42), source: "manual", isRecurring: false },
    { type: "expense", amount: 2100, category: "Transport", description: "Fuel & Metro Card Reload", date: daysAgo(45), source: "manual", isRecurring: false },
    { type: "expense", amount: 8400, category: "Travel", description: "Weekend Mountain Getaway Stay", date: daysAgo(48), source: "manual", isRecurring: false },

    // Month 3 (-2 months)
    { type: "income", amount: 75000, category: "Salary", description: "Monthly Tech Salary", date: daysAgo(65), source: "manual", isRecurring: true },
    { type: "expense", amount: 22000, category: "Housing", description: "Monthly Rent Payment", date: daysAgo(66), source: "manual", isRecurring: true },
    { type: "expense", amount: 4800, category: "Groceries", description: "Weekly Grocery Run", date: daysAgo(68), source: "manual", isRecurring: false },
    { type: "expense", amount: 2499, category: "Subscriptions", description: "Media & Cloud Subscriptions", date: daysAgo(70), source: "manual", isRecurring: true },
    { type: "expense", amount: 3100, category: "Dining", description: "Dining Out & Takeouts", date: daysAgo(72), source: "manual", isRecurring: false },
    { type: "expense", amount: 1800, category: "Transport", description: "Cab Rides", date: daysAgo(75), source: "manual", isRecurring: false },
  ];

  const sampleBudgets = [
    { category: "Housing", limit: 25000, month: currentMonth },
    { category: "Groceries", limit: 8000, month: currentMonth },
    { category: "Dining", limit: 6000, month: currentMonth },
    { category: "Subscriptions", limit: 3000, month: currentMonth },
    { category: "Transport", limit: 4000, month: currentMonth },
    { category: "Shopping", limit: 10000, month: currentMonth },
  ];

  const sampleGoals = [
    {
      title: "Japan Spring Expedition",
      targetAmount: 250000,
      savedAmount: 145000,
      deadline: new Date(now.getFullYear(), now.getMonth() + 5, 15),
    },
    {
      title: "Emergency Safety Vault (6M)",
      targetAmount: 450000,
      savedAmount: 320000,
      deadline: new Date(now.getFullYear() + 1, now.getMonth(), 1),
    },
  ];

  if (conn) {
    const existingTxCount = await Transaction.countDocuments({ userId });
    if (existingTxCount === 0) {
      await Transaction.insertMany(sampleTransactions.map((tx) => ({ ...tx, userId })));
      await Budget.insertMany(sampleBudgets.map((b) => ({ ...b, userId })));
      await Goal.insertMany(sampleGoals.map((g) => ({ ...g, userId })));
    }
  } else {
    // Memory store fallback
    const userTxs = memoryStore.transactions.filter((t) => t.userId === userId.toString());
    if (userTxs.length === 0) {
      sampleTransactions.forEach((tx) => {
        memoryStore.transactions.push({
          _id: generateId(),
          ...tx,
          userId: userId.toString(),
          createdAt: tx.date,
          updatedAt: tx.date,
        });
      });
      sampleBudgets.forEach((b) => {
        memoryStore.budgets.push({
          _id: generateId(),
          ...b,
          userId: userId.toString(),
          createdAt: new Date(),
        });
      });
      sampleGoals.forEach((g) => {
        memoryStore.goals.push({
          _id: generateId(),
          ...g,
          userId: userId.toString(),
          createdAt: new Date(),
        });
      });
    }
  }
}

