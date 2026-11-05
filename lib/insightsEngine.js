/**
 * Deterministic Financial Health and Insights Engine
 * Calculates score (0-100), money personality, detected subscriptions, and anomalies
 */

export function computeFinancialHealth({ transactions = [], monthlyIncome = 75000, budgets = [] }) {
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7);

  // Filter current month transactions
  const currentMonthTxs = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.toISOString().slice(0, 7) === currentMonthStr;
  });

  const incomeTxs = currentMonthTxs.filter((t) => t.type === "income");
  const expenseTxs = currentMonthTxs.filter((t) => t.type === "expense");

  const totalIncome = incomeTxs.reduce((sum, t) => sum + (t.amount || 0), 0) || monthlyIncome;
  const totalExpense = expenseTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
  const netSavings = Math.max(0, totalIncome - totalExpense);

  // 1. Savings Rate Component (0 to 40 pts)
  // Target: 20-30%+ savings rate gets full marks
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  let savingsScore = Math.min(40, (savingsRate / 25) * 40);

  // 2. Budget Adherence Component (0 to 30 pts)
  let budgetScore = 30;
  if (budgets.length > 0) {
    let overBudgetCount = 0;
    budgets.forEach((b) => {
      const spentInCat = expenseTxs
        .filter((t) => t.category.toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + t.amount, 0);
      if (spentInCat > b.limit) overBudgetCount++;
    });
    const violationRatio = overBudgetCount / budgets.length;
    budgetScore = Math.max(5, 30 - violationRatio * 25);
  }

  // 3. Volatility / Discretionary Balance (0 to 30 pts)
  // Check discretionary spending (dining, shopping, etc.)
  const discretionaryCategories = ["dining", "shopping", "entertainment", "travel"];
  const discretionarySpent = expenseTxs
    .filter((t) => discretionaryCategories.includes(t.category.toLowerCase()))
    .reduce((sum, t) => sum + t.amount, 0);

  const discretionaryRatio = totalIncome > 0 ? discretionarySpent / totalIncome : 0.3;
  let disciplineScore = 30;
  if (discretionaryRatio > 0.4) {
    disciplineScore = Math.max(10, 30 - (discretionaryRatio - 0.4) * 50);
  }

  const rawScore = Math.round(savingsScore + budgetScore + disciplineScore);
  const healthScore = Math.min(98, Math.max(18, rawScore));

  // Determine status & label
  let tier = "Good";
  let tierColor = "#34D399"; // emerald
  let summary = "Strong capital accumulation with stable expenditure discipline.";
  if (healthScore >= 85) {
    tier = "Elite";
    tierColor = "#F5C26B"; // gold
    summary = "Exceptional financial resilience and aggressive compounding velocity.";
  } else if (healthScore < 60) {
    tier = "Needs Attention";
    tierColor = "#FB7185"; // danger
    summary = "High outflow velocity detected. Recommended to curb non-essential budgets.";
  }

  // Detect Subscriptions
  const subscriptionKeywords = ["subscription", "netflix", "spotify", "prime", "cloud", "copilot", "gym", "hotstar", "youtube", "patreon", "adobe", "apple"];
  const subscriptionMap = new Map();

  transactions.forEach((tx) => {
    if (tx.type !== "expense") return;
    const isSubCategory = tx.category.toLowerCase().includes("sub");
    const isSubDesc = subscriptionKeywords.some((k) => tx.description.toLowerCase().includes(k));
    if (tx.isRecurring || isSubCategory || isSubDesc) {
      const key = tx.description.toLowerCase().trim();
      if (!subscriptionMap.has(key)) {
        subscriptionMap.set(key, {
          title: tx.description,
          category: tx.category,
          amount: tx.amount,
          lastBilled: tx.date,
          frequency: "Monthly",
        });
      }
    }
  });

  const subscriptions = Array.from(subscriptionMap.values());
  const monthlySubscriptionBurn = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  // Detect Anomalies (expenses > 2.5x the category average)
  const categoryTotals = {};
  const categoryCounts = {};
  transactions.forEach((tx) => {
    if (tx.type !== "expense") return;
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    categoryCounts[tx.category] = (categoryCounts[tx.category] || 0) + 1;
  });

  const anomalies = [];
  currentMonthTxs.forEach((tx) => {
    if (tx.type !== "expense") return;
    const avg = (categoryTotals[tx.category] || tx.amount) / (categoryCounts[tx.category] || 1);
    if (tx.amount > avg * 1.8 && tx.amount > 3000) {
      anomalies.push({
        id: tx._id,
        category: tx.category,
        description: tx.description,
        amount: tx.amount,
        avgAmount: Math.round(avg),
        severity: tx.amount > avg * 2.5 ? "high" : "medium",
        message: `This ${tx.category} charge of ₹${tx.amount.toLocaleString()} is ${Math.round((tx.amount / avg) * 100 - 100)}% above your average baseline.`,
      });
    }
  });

  // Money Personality
  let personalityType = "The Balanced Strategist";
  let personalityDesc = "You balance forward-looking investments with enjoyable daily living.";
  let archetype = "STRATEGIST";

  if (savingsRate > 40) {
    personalityType = "The Fortress Builder";
    personalityDesc = "Hyper-focused on long-term capital preservation and rapid net worth elevation.";
    archetype = "BUILDER";
  } else if (discretionaryRatio > 0.45) {
    personalityType = "The Experience Maximizer";
    personalityDesc = "Values experiential capital and spontaneity, with room to optimize recurring flows.";
    archetype = "MAXIMIZER";
  } else if (subscriptions.length >= 4) {
    personalityType = "The Digital Nomad Consumer";
    personalityDesc = "Heavy reliance on digital software and streaming infrastructure services.";
    archetype = "DIGITAL_OPTIMIZER";
  }

  // Month-end Forecast
  const dayOfMonth = Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyBurnRate = totalExpense / dayOfMonth;
  const forecastedExpense = Math.round(dailyBurnRate * daysInMonth);
  const projectedSurplus = Math.round(totalIncome - forecastedExpense);

  return {
    healthScore,
    tier,
    tierColor,
    summary,
    savingsRate: Math.round(savingsRate),
    totalIncome,
    totalExpense,
    netSavings,
    forecast: {
      dailyBurnRate: Math.round(dailyBurnRate),
      forecastedExpense,
      projectedSurplus,
      daysRemaining: daysInMonth - dayOfMonth,
    },
    subscriptions,
    monthlySubscriptionBurn,
    anomalies: anomalies.slice(0, 4),
    personality: {
      type: personalityType,
      desc: personalityDesc,
      archetype,
    },
  };
}

