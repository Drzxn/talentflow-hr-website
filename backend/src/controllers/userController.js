import bcrypt from "bcryptjs";
import prisma from "../config/db.js";

export async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        manager: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to load users",
    });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role, manager } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: role || "Employee",
        manager: manager || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        manager: user.manager,
      },
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const id = Number(req.params.id);

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
}