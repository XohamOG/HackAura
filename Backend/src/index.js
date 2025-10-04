const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/', (req, res) => res.send('Hello from Backend'));

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
