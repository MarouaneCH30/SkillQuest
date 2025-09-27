// GET /api/skills?user_id=1
router.get("/skills", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "Missing user_id in query" });
  }

  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM skills WHERE user_id = ?", [user_id]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
