import prisma from "../config/db.js";

export async function getDashboardStats(req, res) {
  try {
    const totalUsers = await prisma.user.count();

    const positions = await prisma.position.findMany();

    const stats = positions.reduce(
      (acc, item) => {
        acc.totalPositions += item.total;
        acc.openPositions += item.open;
        acc.offersReleased += item.released;
        acc.offersAccepted += item.accepted;
        acc.yetToJoin += item.yetToJoin;
        acc.onHold += item.onHold;
        acc.closed += item.closed;
        return acc;
      },
      {
        totalUsers,
        totalPositions: 0,
        openPositions: 0,
        offersReleased: 0,
        offersAccepted: 0,
        yetToJoin: 0,
        onHold: 0,
        closed: 0,
      }
    );

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to load dashboard stats",
    });
  }
}