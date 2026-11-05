import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { adjustments = {}, currentSavings = 25000, expectedAnnualReturn = 8 } = body;

    // adjustments is a map of category -> reduction percentage (e.g. { "Dining": 30, "Shopping": 20 })
    // Calculate total monthly savings increase
    let monthlyFreedCapital = 0;
    Object.entries(adjustments).forEach(([cat, reductionPercent]) => {
      // Base estimated expense per category for simulation
      const baseEstimate = {
        Dining: 6000,
        Shopping: 7000,
        Subscriptions: 2500,
        Groceries: 5000,
        Transport: 3000,
      }[cat] || 4000;

      monthlyFreedCapital += baseEstimate * (Number(reductionPercent) / 100);
    });

    const monthlyContribution = currentSavings + monthlyFreedCapital;
    const monthlyRate = (expectedAnnualReturn / 100) / 12;

    // Generate 12-month timeline
    const timeline = [];
    let compoundedBaseline = 0;
    let compoundedOptimized = 0;

    for (let month = 1; month <= 12; month++) {
      compoundedBaseline = (compoundedBaseline + currentSavings) * (1 + monthlyRate);
      compoundedOptimized = (compoundedOptimized + monthlyContribution) * (1 + monthlyRate);

      timeline.push({
        month: `M${month}`,
        baseline: Math.round(compoundedBaseline),
        optimized: Math.round(compoundedOptimized),
        extraGained: Math.round(compoundedOptimized - compoundedBaseline),
      });
    }

    const totalExtraSavedAfter1Year = Math.round(compoundedOptimized - compoundedBaseline);

    return NextResponse.json({
      success: true,
      monthlyFreedCapital: Math.round(monthlyFreedCapital),
      newMonthlySavings: Math.round(monthlyContribution),
      totalExtraSavedAfter1Year,
      timeline,
    });
  } catch (err) {
    console.error("Simulation error:", err);
    return NextResponse.json({ error: "Simulation calculation failed" }, { status: 500 });
  }
}

