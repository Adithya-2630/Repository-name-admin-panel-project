// @ts-nocheck

import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret";

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174"
    ],
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
  path: "/ws"
});

function broadcast(message) {
  const data = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

/* ADMIN AUTHENTICATION */

function requireAdmin(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

/* ADMIN OR EMPLOYEE AUTHENTICATION */

function requireAdminOrEmployee(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      decoded.role !== "admin" &&
      decoded.role !== "employee"
    ) {
      return res.status(403).json({
        message: "Admin or Employee access required"
      });
    }

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

/* USER AUTHENTICATION */

function requireLogin(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Please login first"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

/* WEBSOCKET */

wss.on("connection", (socket) => {
  console.log("WebSocket client connected");

  socket.send(
    JSON.stringify({
      type: "connected",
      message: "WebSocket connected"
    })
  );

  socket.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

/* HOME */

app.get("/", (req, res) => {
  res.json({
    message: "Prisma Backend is Running"
  });
});

/* LOGIN */

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const account = await prisma.accounts.findUnique({
      where: {
        username
      }
    });

    if (!account) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    if (account.status !== "active") {
      return res.status(403).json({
        message: "Account is inactive"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      account.password || ""
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    if (account.role === "user") {
      await prisma.wallet.upsert({
        where: {
          account_id: account.id
        },
        update: {},
        create: {
          account_id: account.id,
          balance: 10000
        }
      });
    }

    const token = jwt.sign(
      {
        id: account.id,
        username: account.username,
        role: account.role
      },
      JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 5 * 60 * 1000
    });

    res.json({
      message: "Login successful",
      id: account.id,
      username: account.username,
      email: account.email,
      full_name: account.full_name,
      phone: account.phone,
      status: account.status,
      role: account.role,

      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        full_name: account.full_name,
        phone: account.phone,
        status: account.status,
        role: account.role
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed"
    });
  }
});

/* PUBLIC USER REGISTRATION */

app.post("/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const fullName = String(req.body.full_name || "").trim();
    const phone = String(req.body.phone || "").trim();

    if (
      username.length < 3 ||
      !email.includes("@") ||
      password.length < 6 ||
      fullName.length < 2 ||
      !/^\d{10}$/.test(phone)
    ) {
      return res.status(400).json({
        message: "Enter your name, 10-digit phone, valid email, and a 6-character password"
      });
    }

    const existingEmail = await prisma.accounts.findFirst({
      where: { email }
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "That email is already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const account = await prisma.accounts.create({
      data: {
        username,
        email,
        full_name: fullName,
        phone,
        password: passwordHash,
        status: "active",
        role: "user"
      }
    });

    await prisma.wallet.create({
      data: {
        account_id: account.id,
        balance: 10000
      }
    });

    const token = jwt.sign(
      {
        id: account.id,
        username: account.username,
        role: account.role
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 5 * 60 * 1000
    });

    res.status(201).json({
      message: "User account created successfully",
      id: account.id,
      username: account.username,
      email: account.email,
      full_name: account.full_name,
      phone: account.phone,
      status: account.status,
      role: account.role,
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        full_name: account.full_name,
        phone: account.phone,
        status: account.status,
        role: account.role
      }
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "That username is already in use"
      });
    }

    console.error(error);
    res.status(500).json({
      message: "Failed to create user account"
    });
  }
});

/* SUPPORT CHAT */

const removeExpiredChatConversations = async () => {
  const expirationDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await prisma.support_conversation.deleteMany({
    where: {
      updated_at: {
        lt: expirationDate
      }
    }
  });
};

app.get("/chat/conversations", requireAdminOrEmployee, async (req, res) => {
  try {
    await removeExpiredChatConversations();

    const conversations = await prisma.support_conversation.findMany({
      include: {
        account: {
          select: {
            id: true,
            username: true,
            full_name: true,
            phone: true,
            email: true
          }
        },
        messages: {
          orderBy: { created_at: "desc" },
          take: 1
        }
      },
      orderBy: { updated_at: "desc" }
    });

    res.json({ conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load chat conversations" });
  }
});

app.get("/chat/messages", requireLogin, async (req, res) => {
  try {
    await removeExpiredChatConversations();

    const requestedAccountId = Number(req.query.account_id);
    const isStaff =
      req.user.role === "admin" || req.user.role === "employee";
    const accountId = isStaff
      ? requestedAccountId
      : Number(req.user.id);

    if (!Number.isInteger(accountId) || accountId < 1) {
      return res.status(400).json({ message: "A valid customer is required" });
    }

    const conversation = await prisma.support_conversation.findUnique({
      where: { account_id: accountId },
      include: {
        account: {
          select: {
            id: true,
            username: true,
            full_name: true,
            phone: true,
            email: true
          }
        },
        messages: {
          orderBy: { created_at: "asc" },
          include: {
            sender: {
              select: { id: true, username: true, role: true }
            }
          }
        }
      }
    });

    res.json({ conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load chat messages" });
  }
});

app.post("/chat/messages", requireLogin, async (req, res) => {
  try {
    await removeExpiredChatConversations();

    const content = String(req.body.content || "").trim();
    const requestedAccountId = Number(req.body.account_id);
    const isStaff =
      req.user.role === "admin" || req.user.role === "employee";
    const accountId = isStaff
      ? requestedAccountId
      : Number(req.user.id);

    if (!content || content.length > 2000) {
      return res.status(400).json({
        message: "Message must contain between 1 and 2,000 characters"
      });
    }

    if (!Number.isInteger(accountId) || accountId < 1) {
      return res.status(400).json({ message: "A valid customer is required" });
    }

    const conversation = await prisma.support_conversation.upsert({
      where: { account_id: accountId },
      update: {},
      create: { account_id: accountId }
    });

    const message = await prisma.support_message.create({
      data: {
        conversation_id: conversation.id,
        sender_id: Number(req.user.id),
        sender_role: req.user.role,
        content
      },
      include: {
        sender: {
          select: { id: true, username: true, role: true }
        }
      }
    });

    await prisma.support_conversation.update({
      where: { id: conversation.id },
      data: { updated_at: new Date() }
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send chat message" });
  }
});

/* LOGOUT */

app.post("/logout", (req, res) => {
  res.clearCookie("token");

  res.json({
    message: "Logout successful"
  });
});

/* CURRENT USER */

app.get("/me", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      authenticated: true,
      user: decoded
    });
  } catch {
    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
});

/* ADMIN - GET ACCOUNTS */

app.get(
  "/accounts",
  requireAdmin,
  async (req, res) => {
    try {
      const accounts =
        await prisma.accounts.findMany({
          select: {
            id: true,
            username: true,
            full_name: true,
            phone: true,
            email: true,
            status: true,
            role: true,
            can_add_money: true
          }
        });

      res.json({
        accounts
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to fetch accounts"
      });
    }
  }
);

/* ADMIN - CREATE ACCOUNT */

app.post(
  "/accounts",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        full_name,
        phone
      } = req.body;

      if (
        !String(username || "").trim() ||
        !String(email || "").trim() ||
        !String(password || "").trim()
      ) {
        return res.status(400).json({
          message: "Employee ID, email, and password are required"
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const account =
        await prisma.accounts.create({
          data: {
            username,
            email,
            full_name: String(full_name || "").trim() || null,
            phone: String(phone || "").trim() || null,
            password: hashedPassword,
            status: "active",
            role: "employee"
          }
        });

      broadcast({
        type: "account_created",
        account
      });

      res.json({
        message: "Account created successfully",
        account
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to create account"
      });
    }
  }
);

/* ADMIN - CONTROL USER WALLET TOP-UP ACCESS */

app.put(
  "/accounts/:id/top-up-access",
  requireAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const canAddMoney = req.body.can_add_money;

      if (!Number.isInteger(id) || typeof canAddMoney !== "boolean") {
        return res.status(400).json({
          message: "Invalid account or wallet permission"
        });
      }

      const account = await prisma.accounts.findUnique({
        where: { id },
        select: { role: true }
      });

      if (!account || account.role !== "user") {
        return res.status(404).json({
          message: "User account not found"
        });
      }

      const updatedAccount = await prisma.accounts.update({
        where: { id },
        data: { can_add_money: canAddMoney },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          role: true,
          can_add_money: true
        }
      });

      res.json({
        message: canAddMoney
          ? "Wallet top-up access granted"
          : "Wallet top-up access revoked",
        account: updatedAccount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to update wallet permission"
      });
    }
  }
);

/* ADMIN - UPDATE EMPLOYEE CREDENTIALS */

app.put(
  "/accounts/:id/credentials",
  requireAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const username = String(req.body.username || "").trim();
      const password = String(req.body.password || "");

      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
          message: "Invalid employee account"
        });
      }

      if (username.length < 3) {
        return res.status(400).json({
          message: "Employee ID must be at least 3 characters"
        });
      }

      const employee = await prisma.accounts.findUnique({
        where: { id },
        select: { role: true }
      });

      if (!employee || employee.role !== "employee") {
        return res.status(404).json({
          message: "Employee account not found"
        });
      }

      const data = {
        username,
        ...(password
          ? { password: await bcrypt.hash(password, 10) }
          : {})
      };

      if (password && password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters"
        });
      }

      const account = await prisma.accounts.update({
        where: { id },
        data,
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          role: true
        }
      });

      broadcast({
        type: "account_updated",
        account
      });

      res.json({
        message: "Employee credentials updated successfully",
        account
      });
    } catch (error) {
      if (error?.code === "P2002") {
        return res.status(409).json({
          message: "That employee ID is already in use"
        });
      }

      console.error(error);
      res.status(500).json({
        message: "Failed to update employee credentials"
      });
    }
  }
);

/* ADMIN - DELETE ACCOUNT */

app.delete(
  "/accounts/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await prisma.accounts.delete({
        where: {
          id
        }
      });

      broadcast({
        type: "account_deleted",
        account_id: id
      });

      res.json({
        message: "Account deleted successfully"
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to delete account"
      });
    }
  }
);

/* ADMIN - DEACTIVATE ACCOUNT */

app.put(
  "/accounts/:id/deactivate",
  requireAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const account =
        await prisma.accounts.update({
          where: {
            id
          },
          data: {
            status: "inactive"
          }
        });

      broadcast({
        type: "account_updated",
        account
      });

      res.json({
        message:
          "Account deactivated successfully",
        account
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to deactivate account"
      });
    }
  }
);

/* ADMIN - ACTIVATE ACCOUNT */

app.put(
  "/accounts/:id/activate",
  requireAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const account =
        await prisma.accounts.update({
          where: {
            id
          },
          data: {
            status: "active"
          }
        });

      broadcast({
        type: "account_updated",
        account
      });

      res.json({
        message: "Account activated successfully",
        account
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to activate account"
      });
    }
  }
);

/* PRODUCTS */

app.get(
  "/products",
  async (req, res) => {
    try {
    const products =
  await prisma.products.findMany({
    orderBy: {
      price: "asc"
    }
  });

      res.json({
        products
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to fetch products"
      });
    }
  }
);

/* ADMIN + EMPLOYEE - CREATE PRODUCT */

app.post(
  "/products",
  requireAdminOrEmployee,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        brand,
        stock,
        image_url,
        details
      } = req.body;

      if (
        !String(name || "").trim() ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0 ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0
      ) {
        return res.status(400).json({
          message: "Name, price, and a non-negative whole-number stock are required"
        });
      }

      const product =
        await prisma.products.create({
          data: {
            name,
            description,
            price: Number(price),
            category,
            brand,
            stock: Number(stock),
            image_url,
            details
          }
        });

      broadcast({
        type: "product_created",
        product
      });

      res.json({
        message: "Product added successfully",
        product
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to create product"
      });
    }
  }
);

app.put(
  "/products/:id",
  requireAdminOrEmployee,
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      if (!Number.isInteger(productId) || productId < 1) {
        return res.status(400).json({
          message: "Invalid product ID"
        });
      }

      if (
        !String(req.body.name || "").trim() ||
        !Number.isFinite(Number(req.body.price)) ||
        Number(req.body.price) < 0 ||
        !Number.isInteger(Number(req.body.stock)) ||
        Number(req.body.stock) < 0
      ) {
        return res.status(400).json({
          message: "Name, price, and a non-negative whole-number stock are required"
        });
      }

      const product = await prisma.products.update({
        where: {
          id: productId
        },
        data: {
          name: req.body.name,
          description: req.body.description,
          price: Number(req.body.price),
          category: req.body.category,
          brand: req.body.brand,
          stock: Number(req.body.stock),
          image_url: req.body.image_url,
          details: req.body.details
        }
      });

      broadcast({
        type: "product_updated",
        product
      });

      res.json({
        message: "Product updated successfully",
        product
      });
    } catch (error) {
      if (error?.code === "P2025") {
        return res.status(404).json({
          message: "Product not found. Refresh the product list and try again."
        });
      }

      console.error(error);

      res.status(500).json({
        message: "Failed to update product"
      });
    }
  }
);

app.delete(
  "/products/:id",
  requireAdminOrEmployee,
  async (req, res) => {
    try {
      const productId = Number(req.params.id);

      if (!Number.isInteger(productId) || productId < 1) {
        return res.status(400).json({
          message: "Invalid product ID"
        });
      }

      const product = await prisma.$transaction(async (transaction) => {
        await transaction.cart_items.deleteMany({
          where: {
            product_id: productId
          }
        });

        return transaction.products.delete({
          where: {
            id: productId
          }
        });
      });

      broadcast({
        type: "product_deleted",
        product
      });

      res.json({
        message: "Product deleted successfully",
        product
      });
    } catch (error) {
      if (error?.code === "P2025") {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      console.error(error);

      res.status(500).json({
        message: "Failed to delete product"
      });
    }
  }
);

/* ========================= */
/* CART - ADD PRODUCT */
/* ========================= */

app.post(
  "/cart/add",
  requireLogin,
  async (req, res) => {
    try {
      const accountId = Number(req.user.id);
      const productId = Number(req.body.product_id);
      const quantity = Number(req.body.quantity || 1);

      if (!productId || quantity < 1) {
        return res.status(400).json({
          message: "Invalid product or quantity"
        });
      }

      const product =
        await prisma.products.findUnique({
          where: {
            id: productId
          }
        });

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: "Not enough stock"
        });
      }

      let cart = await prisma.cart.findUnique({
        where: {
          account_id: accountId
        }
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            account_id: accountId
          }
        });
      }

      const existingItem =
        await prisma.cart_items.findUnique({
          where: {
            cart_id_product_id: {
              cart_id: cart.id,
              product_id: productId
            }
          }
        });

      let cartItem;

      if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
          return res.status(400).json({
            message: "Cart quantity cannot exceed available stock"
          });
        }

        cartItem =
          await prisma.cart_items.update({
            where: {
              id: existingItem.id
            },
            data: {
              quantity:
                existingItem.quantity + quantity
            }
          });
      } else {
        cartItem =
          await prisma.cart_items.create({
            data: {
              cart_id: cart.id,
              product_id: productId,
              quantity
            }
          });
      }

      res.json({
        message: "Product added to cart",
        cartItem
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to add product to cart"
      });
    }
  }
);

app.get(
  "/wallet",
  requireLogin,
  async (req, res) => {
    try {
      const wallet = await prisma.wallet.upsert({
        where: {
          account_id: Number(req.user.id)
        },
        update: {},
        create: {
          account_id: Number(req.user.id),
          balance: 10000
        }
      });

      res.json({
        wallet,
        canAddMoney: req.user.role === "user"
          ? (await prisma.accounts.findUnique({
              where: { id: Number(req.user.id) },
              select: { can_add_money: true }
            }))?.can_add_money === true
          : false
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to fetch wallet"
      });
    }
  }
);

app.post(
  "/wallet/add-money",
  requireLogin,
  async (req, res) => {
    try {
      if (req.user.role !== "user") {
        return res.status(403).json({
          message: "Only user accounts can add money to a wallet"
        });
      }

      const account = await prisma.accounts.findUnique({
        where: { id: Number(req.user.id) },
        select: { can_add_money: true }
      });

      if (!account?.can_add_money) {
        return res.status(403).json({
          message: "Your admin has not enabled wallet top-ups for your account"
        });
      }

      const amount = Number(req.body.amount);

      if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
        return res.status(400).json({
          message: "Enter an amount between ₹1 and ₹10,00,000"
        });
      }

      const roundedAmount = Math.round(amount * 100) / 100;
      const wallet = await prisma.wallet.upsert({
        where: {
          account_id: Number(req.user.id)
        },
        update: {
          balance: {
            increment: roundedAmount
          }
        },
        create: {
          account_id: Number(req.user.id),
          balance: 10000 + roundedAmount
        }
      });

      res.json({
        message: `₹${roundedAmount.toLocaleString("en-IN")} added to wallet`,
        wallet
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to add money to wallet"
      });
    }
  }
);

app.post(
  "/wallet/checkout",
  requireLogin,
  async (req, res) => {
    try {
      const items = Array.isArray(req.body.items)
        ? req.body.items
        : [];

      if (items.length === 0) {
        return res.status(400).json({
          message: "Your cart is empty"
        });
      }

      const productIds = items.map((item) => Number(item.id));

      if (
        productIds.some(
          (productId) => !Number.isInteger(productId) || productId < 1
        )
      ) {
        return res.status(400).json({
          message: "Some cart products are not available for checkout yet"
        });
      }

      const result = await prisma.$transaction(async (transaction) => {
        const products = await transaction.products.findMany({
          where: {
            id: {
              in: productIds
            }
          }
        });

        const productsById = new Map(
          products.map((product) => [product.id, product])
        );
        let total = 0;

        for (const item of items) {
          const product = productsById.get(Number(item.id));
          const quantity = Number(item.quantity);

          if (!product || !Number.isInteger(quantity) || quantity < 1) {
            throw new Error("INVALID_CART");
          }

          if (product.stock < quantity) {
            throw new Error("INSUFFICIENT_STOCK");
          }

          total += product.price * quantity;
        }

        const wallet = await transaction.wallet.upsert({
          where: {
            account_id: Number(req.user.id)
          },
          update: {},
          create: {
            account_id: Number(req.user.id),
            balance: 10000
          }
        });

        if (wallet.balance < total) {
          throw new Error("INSUFFICIENT_FUNDS");
        }

        const updatedWallet = await transaction.wallet.update({
          where: {
            account_id: Number(req.user.id)
          },
          data: {
            balance: wallet.balance - total
          }
        });

        for (const item of items) {
          const product = productsById.get(Number(item.id));
          await transaction.products.update({
            where: {
              id: product.id
            },
            data: {
              stock: {
                decrement: Number(item.quantity)
              }
            }
          });
        }

        return {
          total,
          wallet: updatedWallet
        };
      });

      res.json({
        message: "Checkout completed successfully",
        ...result
      });
    } catch (error) {
      if (error.message === "INVALID_CART") {
        return res.status(400).json({
          message: "Your cart contains an invalid product"
        });
      }

      if (error.message === "INSUFFICIENT_STOCK") {
        return res.status(409).json({
          message: "One or more products no longer have enough stock"
        });
      }

      if (error.message === "INSUFFICIENT_FUNDS") {
        return res.status(409).json({
          message: "Insufficient wallet balance"
        });
      }

      console.error(error);
      res.status(500).json({
        message: "Checkout failed"
      });
    }
  }
);

/* ========================= */
/* CART - GET CART */
/* ========================= */

app.get(
  "/cart",
  requireLogin,
  async (req, res) => {
    try {
      const accountId = Number(req.user.id);

      const cart = await prisma.cart.findUnique({
        where: {
          account_id: accountId
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!cart) {
        return res.json({
          cart: {
            items: []
          }
        });
      }

      res.json({
        cart
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to fetch cart"
      });
    }
  }
);

/* ========================= */
/* CART - UPDATE QUANTITY */
/* ========================= */

app.put(
  "/cart/:itemId",
  requireLogin,
  async (req, res) => {
    try {
      const accountId = Number(req.user.id);
      const itemId = Number(req.params.itemId);
      const quantity = Number(req.body.quantity);

      if (quantity < 1) {
        return res.status(400).json({
          message: "Quantity must be at least 1"
        });
      }

      const item =
        await prisma.cart_items.findFirst({
          where: {
            id: itemId,
            cart: {
              account_id: accountId
            }
          }
        });

      if (!item) {
        return res.status(404).json({
          message: "Cart item not found"
        });
      }

      const updatedItem =
        await prisma.cart_items.update({
          where: {
            id: itemId
          },
          data: {
            quantity
          }
        });

      res.json({
        message: "Cart updated successfully",
        item: updatedItem
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to update cart"
      });
    }
  }
);

/* ========================= */
/* CART - REMOVE PRODUCT */
/* ========================= */

app.delete(
  "/cart/:itemId",
  requireLogin,
  async (req, res) => {
    try {
      const accountId = Number(req.user.id);
      const itemId = Number(req.params.itemId);

      const item =
        await prisma.cart_items.findFirst({
          where: {
            id: itemId,
            cart: {
              account_id: accountId
            }
          }
        });

      if (!item) {
        return res.status(404).json({
          message: "Cart item not found"
        });
      }

      await prisma.cart_items.delete({
        where: {
          id: itemId
        }
      });

      res.json({
        message: "Product removed from cart"
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to remove product"
      });
    }
  }
);

/* ATTENDANCE - MARK */

app.post(
  "/attendance",
  requireAdminOrEmployee,
  async (req, res) => {
    try {
      const {
        status
      } = req.body;

      if (!status) {
        return res.status(400).json({
          message: "Status is required"
        });
      }

      const attendance =
        await prisma.attendance.create({
          data: {
            account_id: Number(req.user.id),
            date: new Date(),
            status
          }
        });

      broadcast({
        type: "attendance_updated",
        attendance
      });

      res.json({
        message: "Attendance marked successfully",
        attendance
      });
    } catch (error) {
      if (error?.code === "P2002") {
        return res.status(409).json({
          message: "Attendance has already been marked for today"
        });
      }

      console.error(error);

      res.status(500).json({
        message: "Failed to mark attendance"
      });
    }
  }
);

/* ATTENDANCE - GET */

app.get(
  "/attendance",
  async (req, res) => {
    try {
      const attendance =
        await prisma.attendance.findMany({
          orderBy: {
            date: "desc"
          }
        });

      res.json({
        attendance
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to fetch attendance"
      });
    }
  }
);

/* START SERVER */

server.listen(3000, () => {
  console.log(
    "Prisma backend running on http://localhost:3000"
  );

  console.log(
    "WebSocket running on ws://localhost:3000/ws"
  );
});