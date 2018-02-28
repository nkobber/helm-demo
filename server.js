const express = require('express')
const app = express();

app.get('/', (req, res) => res.send('Hello, Kelsey Hightower'));
app.get('/ping', (req, res) => res.send('pong'));

app.listen(8080, () => console.error('Listening on port 8080'));
