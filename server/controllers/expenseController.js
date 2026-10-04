const mongoose = require("mongoose");
const Expense = require("../models/Expense");

// POST - Create expense associated strictly with req.user.id
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, type, isRecurring } = req.body;

    if (!title || amount === undefined || amount === null || !category || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount)) {
      return res.status(400).json({ message: "Amount must be a valid number" });
    }

    const userId = req.user.id.toString();

    const expense = await Expense.create({
      userId,
      title: title.trim(),
      amount: parsedAmount,
      category: category.trim(),
      date: new Date(date),
      type: type || 'expense',
      isRecurring: Boolean(isRecurring)
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Retrieve only expenses belonging to authenticated user
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Retrieve an expense by ID only if owned by authenticated user
const getExpenseById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Expense ID format" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const userId = (req.user?.id || req.user?._id || req.user).toString();
    if (String(expense.userId) !== userId) {
      return res.status(403).json({ message: "Access denied. You do not own this expense." });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT - Update expense by ID only if owned by authenticated user
const updateExpense = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Expense ID format" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const userId = (req.user?.id || req.user?._id || req.user).toString();
    if (String(expense.userId) !== userId) {
      return res.status(403).json({ message: "Access denied. You cannot modify an expense you do not own." });
    }

    const { title, amount, category, date, type, isRecurring } = req.body;

    if (title !== undefined) expense.title = title.trim();
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount)) {
        return res.status(400).json({ message: "Amount must be a valid number" });
      }
      expense.amount = parsedAmount;
    }
    if (category !== undefined) expense.category = category.trim();
    if (date !== undefined) expense.date = new Date(date);
    if (type !== undefined) expense.type = type;
    if (isRecurring !== undefined) expense.isRecurring = Boolean(isRecurring);

    const updatedExpense = await expense.save();
    res.status(200).json(updatedExpense);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE - Delete expense by ID only if owned by authenticated user
const deleteExpense = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Expense ID format" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const userId = (req.user?.id || req.user?._id || req.user).toString();
    if (String(expense.userId) !== userId) {
      return res.status(403).json({ message: "Access denied. You cannot delete an expense you do not own." });
    }

    await expense.deleteOne();
    res.status(200).json({ message: "Expense deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense };

