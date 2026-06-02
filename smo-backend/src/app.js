const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/questions');
const answersRoutes = require('./routes/answers');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'smo-backend' });
});

// Liveness probe for deploy platforms. If this stops returning 200,
// the orchestrator knows to restart the service.
app.get('/health', (req, res) => {
    res.json({ ok: true });
});

app.use('/auth', authRoutes);
app.use('/questions', questionsRoutes);
app.use('/answers', answersRoutes);

app.use((req, res) => {
    res.status(404).json({ error: `no route ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'internal server error' });
});

module.exports = app;
