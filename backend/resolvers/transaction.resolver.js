import Transaction from "../models/transaction.model.js";

const transactionResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        if (!context.getUser()) {
          throw new Error("Unauthorized");
        }

        const userId = context.getUser()._id;

        const transactions = await Transaction.find({ userId });

        return transactions;
      } catch (error) {
        console.log("Error in getting transactions: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    transaction: async (_, { transactionId }) => {
      try {
        console.log("transactionId: ", transactionId);
        const transaction = await Transaction.findById(transactionId);
        return transaction;
      } catch (error) {
        console.log("Error in getting transaction: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    categoryStatistics: async (_, __, context) => {
      if (!context.getUser()) {
        throw new Error("Unauthorized");
      }

      const userId = context.getUser()._id;
      const transactions = await Transaction.find({ userId });
      const categoryMap = {};

      transactions.forEach((transaction) => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        categoryMap[transaction.category] += transaction.amount;
      });

      return Object.entries(categoryMap).map(([category, amount]) => ({
        category,
        totalAmount: amount,
      }));
    },
  },
  Mutation: {
    createTransaction: async (_, { input }, context) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });

        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.log("Error in creating transaction: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    updateTransaction: async (_, { input }) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          input,
          { new: true }
        );

        return updatedTransaction;
      } catch (error) {
        console.log("Error in updating transaction: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    deleteTransaction: async (_, { transactionId }) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );

        return deletedTransaction;
      } catch (error) {
        console.log("Error in deleting transaction: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
  },
};

export default transactionResolver;
