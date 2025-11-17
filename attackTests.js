const axios = require("axios");

const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("🚨 מתחילים בדיקות תקיפה 🚨\n");

  // 1. XSS Test
  try {
    const res = await axios.post(`${BASE_URL}/api/register`, {
      name: "<script>alert('XSS')</script>",
      email: "xss@example.com",
      password: "password123",
    });
    console.log("❌ XSS הצליח! ⚠️", res.data);
  } catch (err) {
    console.log("✅ XSS Test: נחסם בהצלחה ✅", err.response?.data);
  }

  // 2. NoSQL Injection
  try {
    const res = await axios.post(`${BASE_URL}/api/login`, {
      email: { $gt: "" },
      password: "doesntmatter",
    });
    console.log("❌ NoSQL Injection הצליח! ⚠️", res.data);
  } catch (err) {
    console.log("✅ NoSQL Injection Test: נחסם בהצלחה ✅", err.response?.data);
  }

  // 3. Invalid JWT Test
  try {
    const res = await axios.get(`${BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer invalidtoken123`,
      },
    });
    console.log("❌ גישה עם טוקן לא תקין הצליחה! ⚠️", res.data);
  } catch (err) {
    console.log("✅ Invalid JWT Test: נחסם בהצלחה ✅", err.response?.data);
  }

  // 4. Rate Limiting (שליחה מהירה של בקשות)
  let passed = 0,
    blocked = 0;
  for (let i = 0; i < 150; i++) {
    try {
      await axios.get(`${BASE_URL}/`);
      passed++;
    } catch (err) {
      blocked++;
    }
  }
  console.log(`✅ Rate Limiting Test: עברו ${passed}, נחסמו ${blocked}`);
}

runTests();
