const express = require('express')
const app = express();

app.get('/', (req, res) => res.send('Hello, Cloud Native Aarhus!'));
app.get('/ping', (req, res) => res.send('pong'));

app.listen(8080, () => console.error('Listening on port 8080'));
