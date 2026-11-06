import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import Budget from "@/lib/models/Budget";
import User from "@/lib/models/User";
import { memoryStore } from "@/lib/memoryStore";
import { computeFinancialHealth } from "@/lib/insightsEngine";
import { callGemini } from "@/lib/gemini";

// In-memory cache for expensive AI commentary
const insightsCache = new Map();

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conn = await connectDB();
    let transactions = [];
    let budgets = [];
    let user = null;

    if (conn) {
      transactions = await Transaction.find({ userId: session.userId }).sort({ date: -1 }).lean();
      budgets = await Budget.find({ userId: session.userId }).lean();
      user = await User.findById(session.userId).lean();
    } else {
      transactions = memoryStore.transactions.filter((t) => t.userId === session.userId.toString());
      budgets = memoryStore.budgets.filter((b) => b.userId === session.userId.toString());
      user = memoryStore.users.find((u) => u._id.toString() === session.userId.toString());
    }

    const monthlyIncome = user?.monthlyIncome || 75000;
    const baseMetrics = computeFinancialHealth({
      transactions,
      monthlyIncome,
      budgets,
    });

    // Check cache for AI summary
    const cacheKey = `${session.userId}_${transactions.length}_${baseMetrics.savingsRate}_${baseMetrics.totalExpense}`;
    let aiCommentary = insightsCache.get(cacheKey);

    if (!aiCommentary) {
      // Try Gemini 1.5 Flash for personalized commentary
      const prompt = `Based on this user's financial profile:
Savings Rate: ${baseMetrics.savingsRate}%
Monthly Inflow: ₹${baseMetrics.totalIncome}
Monthly Outflow: ₹${baseMetrics.totalExpense}
Active Subscriptions: ${baseMetrics.subscriptions.length} (₹${baseMetrics.monthlySubscriptionBurn}/mo)
Anomalies Detected: ${baseMetrics.anomalies.length}
Personality Archetype: ${baseMetrics.personality.type}

Provide 3 short, punchy, actionable bullet points as financial advice. Format strictly as JSON array of 3 strings: ["tip1", "tip2", "tip3"].`;

      const aiRes = await callGemini({ prompt, responseSchema: true });
      if (aiRes.success && Array.isArray(aiRes.data)) {
        aiCommentary = aiRes.data;
      } else {
        // Deterministic high-quality advice fallback
        aiCommentary = [
          baseMetrics.savingsRate >= 25
            ? `Excellent savings discipline at ${baseMetrics.savingsRate}%. Consider routing excess surplus towards high-yield index funds.`
            : `Your savings rate is ${baseMetrics.savingsRate}%. Strive for the 20% golden benchmark by trimming discretionary dining.`,
          baseMetrics.subscriptions.length > 0
            ? `You have ${baseMetrics.subscriptions.length} recurring subscriptions totalling ₹${baseMetrics.monthlySubscriptionBurn.toLocaleString()}/mo. Audit quarterly to eliminate unused licenses.`
            : `No recurring subscriptions detected. Keep subscription overhead minimal to preserve monthly cashflow flexibility.`,
          baseMetrics.anomalies.length > 0
            ? `Unusual spike detected in ${baseMetrics.anomalies[0].category} (₹${baseMetrics.anomalies[0].amount.toLocaleString()}). Keep an eye on non-essential impulse spending.`
            : `Expenditure velocity is consistent across all core categories with zero abnormal outliers this cycle.`,
        ];
      }

      insightsCache.set(cacheKey, aiCommentary);
      setTimeout(() => insightsCache.delete(cacheKey), 10 * 60 * 1000); // 10 min cache
    }

    return NextResponse.json({
      metrics: baseMetrics,
      aiAdvice: aiCommentary,
      currency: user?.currency || "INR",
    });
  } catch (err) {
    console.error("Insights error:", err);
    return NextResponse.json({ error: "Failed to generate financial insights" }, { status: 500 });
  }
}

