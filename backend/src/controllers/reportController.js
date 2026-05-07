import prisma from "../config/db.js";

export async function getDepartmentReports(req, res) {
  try {
    const positions = await prisma.position.findMany({
      orderBy: {
        department: "asc",
      },
    });

    return res.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    console.error("REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to load reports",
    });
  }
}

export async function createPosition(req, res) {
  try {
    const {
      department,
      title,
      status,
      total,
      open,
      released,
      accepted,
      yetToJoin,
      onHold,
      closed,
    } = req.body;

    if (!department || !title) {
      return res.status(400).json({
        success: false,
        error: "Department and title are required",
      });
    }

    const position = await prisma.position.create({
      data: {
        department,
        title,
        status: status || "Open",
        total: Number(total || 1),
        open: Number(open || 1),
        released: Number(released || 0),
        accepted: Number(accepted || 0),
        yetToJoin: Number(yetToJoin || 0),
        onHold: Number(onHold || 0),
        closed: Number(closed || 0),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Position created successfully",
      data: position,
    });
  } catch (error) {
    console.error("CREATE POSITION ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create position",
    });
  }
}