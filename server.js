require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const { authenticateToken, checkLinkedStudent } = require('./middleware/auth');


const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/auth', authRoutes);
app.use("/student", authenticateToken, checkLinkedStudent, studentRoutes);
app.get("/", (req, res) => {
    res.send("Welcome to the Student Portal API");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
