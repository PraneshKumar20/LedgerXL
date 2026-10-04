const express = require("express");
const router  = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense } = require("../controllers/expenseController");

// Protect all expense routes with JWT authentication
router.use(authMiddleware);

// POST - to create new expense (associated with authenticated user)
router.post("/", createExpense);

// GET - get all expenses for authenticated user
router.get("/", getExpenses);

// GET - get expense by ID (only if owned by authenticated user)
router.get("/:id", getExpenseById);

// PUT - update expense by ID (only if owned by authenticated user)
router.put("/:id", updateExpense);

// DELETE - delete expense by ID (only if owned by authenticated user)
router.delete("/:id", deleteExpense);

module.exports = router;