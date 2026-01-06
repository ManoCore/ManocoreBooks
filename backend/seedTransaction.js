const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Transaction = require("./src/models/Transaction");
const User = require("./src/models/User");


const path = require("path");
console.log("Current dir:", __dirname);
console.log("Looking for .env at:", path.join(__dirname, ".env"));

require("dotenv").config();

console.log("Loaded URI:", process.env.MONGODB_URI);


// Sample transaction data
const sampleTransactions = [
  // Income transactions
  {
    type: "income",
    category: "Sales",
    amount: 15000,
    currency: "USD",
    date: new Date("2024-11-01"),
    description: "Product sales - November",
    paymentMethod: "bank_transfer",
    reference: "INV-001",
  },
  {
    type: "income",
    category: "Services",
    amount: 8500,
    currency: "USD",
    date: new Date("2024-11-05"),
    description: "Consulting services",
    paymentMethod: "credit_card",
    reference: "INV-002",
  },
  {
    type: "income",
    category: "Sales",
    amount: 22000,
    currency: "USD",
    date: new Date("2024-11-10"),
    description: "Bulk order",
    paymentMethod: "bank_transfer",
    reference: "INV-003",
  },
  {
    type: "income",
    category: "Commission",
    amount: 3500,
    currency: "USD",
    date: new Date("2024-11-15"),
    description: "Referral commission",
    paymentMethod: "upi",
    reference: "COMM-001",
  },
  {
    type: "income",
    category: "Services",
    amount: 12000,
    currency: "USD",
    date: new Date("2024-11-20"),
    description: "Design services",
    paymentMethod: "bank_transfer",
    reference: "INV-004",
  },

  // Expense transactions
  {
    type: "expense",
    category: "Salary",
    amount: 25000,
    currency: "USD",
    date: new Date("2024-11-01"),
    description: "Monthly salaries",
    paymentMethod: "bank_transfer",
    reference: "SAL-NOV-2024",
  },
  {
    type: "expense",
    category: "Rent",
    amount: 5000,
    currency: "USD",
    date: new Date("2024-11-01"),
    description: "Office rent",
    paymentMethod: "bank_transfer",
    reference: "RENT-NOV",
  },
  {
    type: "expense",
    category: "Utilities",
    amount: 1200,
    currency: "USD",
    date: new Date("2024-11-05"),
    description: "Electricity and water",
    paymentMethod: "debit_card",
    reference: "UTIL-001",
  },
  {
    type: "expense",
    category: "Marketing",
    amount: 3500,
    currency: "USD",
    date: new Date("2024-11-08"),
    description: "Social media ads",
    paymentMethod: "credit_card",
    reference: "MKT-001",
  },
  {
    type: "expense",
    category: "Software",
    amount: 800,
    currency: "USD",
    date: new Date("2024-11-12"),
    description: "SaaS subscriptions",
    paymentMethod: "credit_card",
    reference: "SOFT-001",
  },
  {
    type: "expense",
    category: "Office Supplies",
    amount: 450,
    currency: "USD",
    date: new Date("2024-11-15"),
    description: "Stationery and equipment",
    paymentMethod: "cash",
    reference: "SUP-001",
  },
  {
    type: "expense",
    category: "Travel",
    amount: 2100,
    currency: "USD",
    date: new Date("2024-11-18"),
    description: "Business trip expenses",
    paymentMethod: "credit_card",
    reference: "TRV-001",
  },
  {
    type: "expense",
    category: "Insurance",
    amount: 1500,
    currency: "USD",
    date: new Date("2024-11-20"),
    description: "Business insurance premium",
    paymentMethod: "bank_transfer",
    reference: "INS-NOV",
  },
];

async function seedTransactions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Find a user to get organizationId
    const user = await User.findOne();
    
    if (!user) {
      console.error(" No user found! Please signup first to create a user and organization.");
      process.exit(1);
    }

    console.log(` Found user: ${user.email}`);
    console.log(` Organization ID: ${user.organizationId}`);

    // Delete existing transactions (optional - for clean testing)
    const deleteResult = await Transaction.deleteMany({ 
      organizationId: user.organizationId 
    });
    console.log(`Deleted ${deleteResult.deletedCount} existing transactions`);

    // Add organizationId to all sample transactions
    const transactionsToInsert = sampleTransactions.map(t => ({
      ...t,
      organizationId: user.organizationId,
    }));

    // Insert transactions
    const inserted = await Transaction.insertMany(transactionsToInsert);
    console.log(` Inserted ${inserted.length} transactions`);

    // Calculate and display summary
    const totalIncome = sampleTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = sampleTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpenses;

    console.log("\n Summary:");
    console.log(` Total Income: $${totalIncome.toLocaleString()}`);
    console.log(` Total Expenses: $${totalExpenses.toLocaleString()}`);
    console.log(`Net Profit: $${netProfit.toLocaleString()}`);

    console.log("\n Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(" Error seeding transactions:", error);
    process.exit(1);
  }
}

seedTransactions();