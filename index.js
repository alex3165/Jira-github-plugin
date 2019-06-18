const express = require('express');
const cors = require('cors');
const { pullRequestHook } = require('./handlers');
const app = express();

const PORT = 4567;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/pull_request', async (req, res) => {
  const response = await pullRequestHook(req.body.payload);
  res.status(response.status).send({ message: response.message });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
