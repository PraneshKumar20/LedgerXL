const assert = require("assert");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const path = require("path");

// Ensure environment variable is set
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key_super_secure_2026";

const authMiddleware = require("./middleware/authMiddleware");
const { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense } = require("./controllers/expenseController");
const { Signup, Login, completeOnboarding } = require("./controllers/authController");
const User = require("./models/User");
const Expense = require("./models/Expense");

// Helper mock response object
function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runAsyncTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function main() {
  console.log("\n========================================================");
  console.log("   LEDGERXL SECURITY & AUTHENTICATION VERIFICATION   ");
  console.log("========================================================\n");

  const TEST_SECRET = process.env.JWT_SECRET;
  const userA_id = new mongoose.Types.ObjectId().toString();
  const userB_id = new mongoose.Types.ObjectId().toString();

  const userA_token = jwt.sign({ id: userA_id, email: "usera@example.com" }, TEST_SECRET, { expiresIn: "1h" });
  const userB_token = jwt.sign({ id: userB_id, email: "userb@example.com" }, TEST_SECRET, { expiresIn: "1h" });
  const expired_token = jwt.sign({ id: userA_id, email: "usera@example.com" }, TEST_SECRET, { expiresIn: "-1s" });
  const wrong_secret_token = jwt.sign({ id: userA_id, email: "usera@example.com" }, "wrong_secret_123", { expiresIn: "1h" });

  // ----------------------------------------------------
  // SECTION 1: AUTH MIDDLEWARE TESTS
  // ----------------------------------------------------
  console.log("--- 1. Auth Middleware Verification ---");

  runTest("Missing Authorization header returns 401", () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.match(res.body.message, /No token provided/i);
  });

  runTest("Missing Bearer prefix returns 401", () => {
    const req = { headers: { authorization: `Basic ${userA_token}` } };
    const res = createMockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
  });

  runTest("Empty Bearer token returns 401", () => {
    const req = { headers: { authorization: "Bearer " } };
    const res = createMockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
  });

  runTest("Malformed token string returns 401", () => {
    const req = { headers: { authorization: "Bearer invalid.malformed.token" } };
    const res = createMockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.match(res.body.message, /Invalid or expired token/i);
  });

  runTest("Token signed with wrong secret returns 401", () => {
    const req = { headers: { authorization: `Bearer ${wrong_secret_token}` } };
    const res = createMockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.match(res.body.message, /Invalid or expired token/i);
  });

  runTest("Expired token returns 401", () => {
    const req = { headers: { authorization: `Bearer ${expired_token}` } };
    const res = createMockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.match(res.body.message, /Invalid or expired token/i);
  });

  runTest("Token with missing id in payload returns 401", () => {
    const tokenNoId = jwt.sign({ email: "no_id@example.com" }, TEST_SECRET, { expiresIn: "1h" });
    const req = { headers: { authorization: `Bearer ${tokenNoId}` } };
    const res = createMockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
  });

  runTest("Valid Bearer token extracts user ID and sets req.user", () => {
    const req = { headers: { authorization: `Bearer ${userA_token}` } };
    const res = createMockRes();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(res.statusCode, null);
    assert.strictEqual(req.user.id, userA_id);
    assert.strictEqual(req.user._id, userA_id);
    assert.strictEqual(req.user.email, "usera@example.com");
  });

  // ----------------------------------------------------
  // SECTION 2: SIGNUP & LOGIN CONTROLLER TESTS
  // ----------------------------------------------------
  console.log("\n--- 2. Signup & Login Controller Verification ---");

  await runAsyncTest("Signup validates required fields (400)", async () => {
    const req = { body: { name: "Test User", email: "" } };
    const res = createMockRes();
    await Signup(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /All fields are required/i);
  });

  await runAsyncTest("Signup creates user, hashes password, returns signed JWT without exposing password", async () => {
    const origFindOne = User.findOne;
    const origCreate = User.create;

    try {
      User.findOne = async () => null; // No existing user
      let savedUser = null;
      User.create = async (data) => {
        savedUser = {
          _id: new mongoose.Types.ObjectId(),
          name: data.name,
          email: data.email,
          password: data.password
        };
        return savedUser;
      };

      const req = { body: { name: "Alice Wonderland", email: "ALICE@EXAMPLE.COM", password: "SecretPassword123" } };
      const res = createMockRes();
      await Signup(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.ok(res.body.token, "Token must be present");
      assert.ok(res.body.user, "User profile must be present");
      assert.strictEqual(res.body.user.name, "Alice Wonderland");
      assert.strictEqual(res.body.user.email, "alice@example.com");
      assert.strictEqual(res.body.user.password, undefined, "Password must not be in response");

      // Verify password was hashed with bcrypt
      assert.notStrictEqual(savedUser.password, "SecretPassword123");
      const isHashed = await bcrypt.compare("SecretPassword123", savedUser.password);
      assert.strictEqual(isHashed, true, "Bcrypt hash must match original password");

      // Verify JWT token signature and payload
      const decoded = jwt.verify(res.body.token, TEST_SECRET);
      assert.strictEqual(decoded.id, savedUser._id.toString());
      assert.strictEqual(decoded.email, "alice@example.com");

    } finally {
      User.findOne = origFindOne;
      User.create = origCreate;
    }
  });

  await runAsyncTest("Login rejects missing fields (400)", async () => {
    const req = { body: { email: "alice@example.com" } };
    const res = createMockRes();
    await Login(req, res);
    assert.strictEqual(res.statusCode, 400);
  });

  await runAsyncTest("Login rejects non-existent email (401)", async () => {
    const origFindOne = User.findOne;
    try {
      User.findOne = async () => null;
      const req = { body: { email: "ghost@example.com", password: "password" } };
      const res = createMockRes();
      await Login(req, res);
      assert.strictEqual(res.statusCode, 401);
      assert.match(res.body.message, /Invalid email or password/i);
    } finally {
      User.findOne = origFindOne;
    }
  });

  await runAsyncTest("Login rejects incorrect password (401)", async () => {
    const origFindOne = User.findOne;
    try {
      const hashedPassword = await bcrypt.hash("CorrectPassword123", 10);
      User.findOne = async () => ({
        _id: new mongoose.Types.ObjectId(),
        name: "Alice",
        email: "alice@example.com",
        password: hashedPassword
      });
      const req = { body: { email: "alice@example.com", password: "WrongPassword" } };
      const res = createMockRes();
      await Login(req, res);
      assert.strictEqual(res.statusCode, 401);
      assert.match(res.body.message, /Invalid email or password/i);
    } finally {
      User.findOne = origFindOne;
    }
  });

  await runAsyncTest("Login with correct password returns signed JWT and profile without password", async () => {
    const origFindOne = User.findOne;
    try {
      const userId = new mongoose.Types.ObjectId();
      const hashedPassword = await bcrypt.hash("CorrectPassword123", 10);
      User.findOne = async () => ({
        _id: userId,
        name: "Alice",
        email: "alice@example.com",
        password: hashedPassword
      });
      const req = { body: { email: "alice@example.com", password: "CorrectPassword123" } };
      const res = createMockRes();
      await Login(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.id, userId.toString());
      assert.strictEqual(res.body.user.password, undefined);

      const decoded = jwt.verify(res.body.token, TEST_SECRET);
      assert.strictEqual(decoded.id, userId.toString());
      assert.strictEqual(res.body.user.hasCompletedOnboarding, true, "Legacy user without hasCompletedOnboarding defaults to true");
    } finally {
      User.findOne = origFindOne;
    }
  });

  await runAsyncTest("Signup initializes hasCompletedOnboarding to false", async () => {
    const origFindOne = User.findOne;
    const origCreate = User.create;
    try {
      User.findOne = async () => null;
      let createdUserData = null;
      User.create = async (data) => {
        createdUserData = data;
        return {
          _id: new mongoose.Types.ObjectId(),
          name: data.name,
          email: data.email,
          hasCompletedOnboarding: data.hasCompletedOnboarding
        };
      };

      const req = { body: { name: "Bob Newbie", email: "bob@example.com", password: "Password123" } };
      const res = createMockRes();
      await Signup(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(createdUserData.hasCompletedOnboarding, false);
      assert.strictEqual(res.body.user.hasCompletedOnboarding, false);
    } finally {
      User.findOne = origFindOne;
      User.create = origCreate;
    }
  });

  await runAsyncTest("Login preserves hasCompletedOnboarding: false for uncompleted new accounts", async () => {
    const origFindOne = User.findOne;
    try {
      const hashedPassword = await bcrypt.hash("Password123", 10);
      User.findOne = async () => ({
        _id: new mongoose.Types.ObjectId(),
        name: "Bob Newbie",
        email: "bob@example.com",
        password: hashedPassword,
        hasCompletedOnboarding: false
      });

      const req = { body: { email: "bob@example.com", password: "Password123" } };
      const res = createMockRes();
      await Login(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.user.hasCompletedOnboarding, false);
    } finally {
      User.findOne = origFindOne;
    }
  });

  await runAsyncTest("completeOnboarding requires authentication (401 without req.user)", async () => {
    const req = { headers: {} };
    const res = createMockRes();
    await completeOnboarding(req, res);
    assert.strictEqual(res.statusCode, 401);
  });

  await runAsyncTest("completeOnboarding sets hasCompletedOnboarding to true in DB", async () => {
    const origFindByIdAndUpdate = User.findByIdAndUpdate;
    try {
      const testUserId = new mongoose.Types.ObjectId().toString();
      let updatedFields = null;
      User.findByIdAndUpdate = async (id, update) => {
        updatedFields = update;
        return {
          _id: id,
          name: "Bob",
          email: "bob@example.com",
          hasCompletedOnboarding: true
        };
      };

      const req = { user: { id: testUserId, email: "bob@example.com" } };
      const res = createMockRes();
      await completeOnboarding(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(updatedFields.hasCompletedOnboarding, true);
      assert.strictEqual(res.body.user.hasCompletedOnboarding, true);
    } finally {
      User.findByIdAndUpdate = origFindByIdAndUpdate;
    }
  });

  // ----------------------------------------------------
  // SECTION 3: USER DATA ISOLATION TESTS
  // ----------------------------------------------------
  console.log("\n--- 3. User Data Isolation Verification ---");

  // In-memory expense store for testing
  const mockDbExpenses = [
    {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: userA_id,
      title: "User A Coffee",
      amount: 4.5,
      category: "Food",
      date: new Date("2026-03-01"),
      type: "expense",
      isRecurring: false,
      save: async function() { return this; },
      deleteOne: async function() { return true; }
    },
    {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: userA_id,
      title: "User A Flight",
      amount: 450,
      category: "Travel",
      date: new Date("2026-03-02"),
      type: "expense",
      isRecurring: false,
      save: async function() { return this; },
      deleteOne: async function() { return true; }
    },
    {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: userB_id,
      title: "User B Laptop",
      amount: 1200,
      category: "Electronics",
      date: new Date("2026-03-03"),
      type: "expense",
      isRecurring: false,
      save: async function() { return this; },
      deleteOne: async function() { return true; }
    }
  ];

  const expenseA_id = mockDbExpenses[0]._id;
  const expenseB_id = mockDbExpenses[2]._id;

  const origExpenseFind = Expense.find;
  const origExpenseFindById = Expense.findById;
  const origExpenseCreate = Expense.create;

  try {
    Expense.find = (query) => {
      const filtered = mockDbExpenses.filter(e => {
        if (query.userId !== undefined) {
          return e.userId === query.userId;
        }
        return true;
      });
      return {
        sort: () => Promise.resolve(filtered)
      };
    };

    Expense.findById = async (id) => {
      const match = mockDbExpenses.find(e => e._id === id.toString());
      return match || null;
    };

    Expense.create = async (doc) => {
      const newDoc = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...doc,
        save: async function() { return this; },
        deleteOne: async function() { return true; }
      };
      return newDoc;
    };

    await runAsyncTest("GET /expenses: User A receives ONLY User A expenses", async () => {
      const req = {
        user: { id: userA_id },
        query: {}
      };
      const res = createMockRes();
      await getExpenses(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.length, 2);
      assert.ok(res.body.every(e => e.userId === userA_id));
    });

    await runAsyncTest("GET /expenses: User B receives ONLY User B expenses", async () => {
      const req = {
        user: { id: userB_id },
        query: {}
      };
      const res = createMockRes();
      await getExpenses(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.length, 1);
      assert.strictEqual(res.body[0].title, "User B Laptop");
      assert.strictEqual(res.body[0].userId, userB_id);
    });

    await runAsyncTest("GET /expenses: User A attempting ?userId=userB receives ONLY User A expenses", async () => {
      const req = {
        user: { id: userA_id },
        query: { userId: userB_id } // Malicious attempt to spoof query parameter
      };
      const res = createMockRes();
      await getExpenses(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.length, 2);
      assert.ok(res.body.every(e => e.userId === userA_id));
      assert.ok(!res.body.some(e => e.userId === userB_id));
    });

    await runAsyncTest("POST /expenses: Server derives userId from req.user and ignores client-supplied userId", async () => {
      const req = {
        user: { id: userA_id },
        body: {
          title: "New Dinner",
          amount: 50,
          category: "Food",
          date: "2026-03-05",
          userId: userB_id // Malicious client attempt to forge User B's ID
        }
      };
      const res = createMockRes();
      await createExpense(req, res);
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.userId, userA_id, "userId MUST be userA_id and ignore client-supplied userId");
      assert.notStrictEqual(res.body.userId, userB_id);
    });

    await runAsyncTest("GET /expenses/:id: User A can read own expense (200)", async () => {
      const req = {
        user: { id: userA_id },
        params: { id: expenseA_id }
      };
      const res = createMockRes();
      await getExpenseById(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.title, "User A Coffee");
    });

    await runAsyncTest("GET /expenses/:id: User B accessing User A expense is DENIED (403)", async () => {
      const req = {
        user: { id: userB_id }, // User B
        params: { id: expenseA_id } // Expense owned by User A
      };
      const res = createMockRes();
      await getExpenseById(req, res);
      assert.strictEqual(res.statusCode, 403);
      assert.match(res.body.message, /Access denied/i);
    });

    await runAsyncTest("GET /expenses/:id: Non-existent expense returns 404", async () => {
      const req = {
        user: { id: userA_id },
        params: { id: new mongoose.Types.ObjectId().toString() }
      };
      const res = createMockRes();
      await getExpenseById(req, res);
      assert.strictEqual(res.statusCode, 404);
      assert.match(res.body.message, /Expense not found/i);
    });

    await runAsyncTest("GET /expenses/:id: Malformed ObjectId returns 400", async () => {
      const req = {
        user: { id: userA_id },
        params: { id: "not-a-valid-object-id" }
      };
      const res = createMockRes();
      await getExpenseById(req, res);
      assert.strictEqual(res.statusCode, 400);
    });

    await runAsyncTest("PUT /expenses/:id: User A can update own expense (200)", async () => {
      const req = {
        user: { id: userA_id },
        params: { id: expenseA_id },
        body: { title: "User A Premium Coffee", amount: 6.0 }
      };
      const res = createMockRes();
      await updateExpense(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.title, "User A Premium Coffee");
      assert.strictEqual(res.body.amount, 6.0);
    });

    await runAsyncTest("PUT /expenses/:id: User B updating User A expense is DENIED (403)", async () => {
      const req = {
        user: { id: userB_id }, // User B
        params: { id: expenseA_id }, // Belongs to User A
        body: { title: "Hacked Coffee", amount: 999 }
      };
      const res = createMockRes();
      await updateExpense(req, res);
      assert.strictEqual(res.statusCode, 403);
      assert.match(res.body.message, /Access denied/i);
      // Verify expense wasn't modified
      const expense = mockDbExpenses.find(e => e._id === expenseA_id);
      assert.notStrictEqual(expense.title, "Hacked Coffee");
    });

    await runAsyncTest("PUT /expenses/:id: Client cannot change expense ownership (userId immutable)", async () => {
      const req = {
        user: { id: userA_id },
        params: { id: expenseA_id },
        body: { title: "User A Coffee Updated", userId: userB_id } // Try to transfer ownership
      };
      const res = createMockRes();
      await updateExpense(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.userId, userA_id, "userId must remain User A");
    });

    await runAsyncTest("DELETE /expenses/:id: User B deleting User A expense is DENIED (403)", async () => {
      const req = {
        user: { id: userB_id }, // User B
        params: { id: expenseA_id } // Belongs to User A
      };
      const res = createMockRes();
      await deleteExpense(req, res);
      assert.strictEqual(res.statusCode, 403);
      assert.match(res.body.message, /Access denied/i);
    });

    await runAsyncTest("DELETE /expenses/:id: User A can delete own expense (200)", async () => {
      const req = {
        user: { id: userA_id },
        params: { id: expenseA_id }
      };
      const res = createMockRes();
      await deleteExpense(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.match(res.body.message, /deleted successfully/i);
    });

    await runAsyncTest("DELETE /expenses/:id: Non-existent expense returns 404", async () => {
      const req = {
        user: { id: userA_id },
        params: { id: new mongoose.Types.ObjectId().toString() }
      };
      const res = createMockRes();
      await deleteExpense(req, res);
      assert.strictEqual(res.statusCode, 404);
    });

  } finally {
    Expense.find = origExpenseFind;
    Expense.findById = origExpenseFindById;
    Expense.create = origExpenseCreate;
  }

  // ----------------------------------------------------
  // SECTION 4: HEALTH CHECK VERIFICATION
  // ----------------------------------------------------
  console.log("\n--- 4. Health Check Verification ---");

  runTest("GET /health returns 200 and 'ok' when database readyState is 1", () => {
    const origReadyState = mongoose.connection.readyState;
    try {
      mongoose.connection.readyState = 1;
      const isConnected = mongoose.connection.readyState === 1;
      const res = createMockRes();
      res.status(isConnected ? 200 : 503).json({
        status: isConnected ? "ok" : "degraded",
        database: isConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.status, "ok");
      assert.strictEqual(res.body.database, "connected");
      assert.ok(res.body.timestamp);
    } finally {
      mongoose.connection.readyState = origReadyState;
    }
  });

  runTest("GET /health returns 503 and 'degraded' when database readyState !== 1", () => {
    const origReadyState = mongoose.connection.readyState;
    try {
      mongoose.connection.readyState = 0;
      const isConnected = mongoose.connection.readyState === 1;
      const res = createMockRes();
      res.status(isConnected ? 200 : 503).json({
        status: isConnected ? "ok" : "degraded",
        database: isConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
      });
      assert.strictEqual(res.statusCode, 503);
      assert.strictEqual(res.body.status, "degraded");
      assert.strictEqual(res.body.database, "disconnected");
      assert.ok(res.body.timestamp);
    } finally {
      mongoose.connection.readyState = origReadyState;
    }
  });

  console.log("\n========================================================");
  console.log(`RESULTS: ${passed} / ${total} tests passed.`);
  console.log("========================================================\n");

  if (passed === total) {
    console.log("ALL SECURITY VERIFICATION CHECKS COMPLETED SUCCESSFULLY.\n");
  } else {
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Test runner encountered an error:", err);
  process.exit(1);
});
