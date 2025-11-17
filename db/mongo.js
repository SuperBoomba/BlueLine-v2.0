let dbConnection;

const connectToDB = async (mongoose) => {
  try {
    dbConnection = await mongoose.connect(
      "mongodb://127.0.0.1:27017/blueline",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
};

const getDB = () => dbConnection;

module.exports = { connectToDB, getDB };
