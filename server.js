require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');


const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/auth', authRoutes);
app.use("/api", apiRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
