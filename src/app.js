const express = require("express");
const cors = require("cors");

const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequest(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.log(logLabel);

  return next();
};

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository =>
    repository.id === id
  );

  if (repositoryIndex < 0)
    return response.status(400).json({ error: 'Repository not found' });

  response.locals.repositoryIndex = repositoryIndex;

  next();
}

app.use(logRequest);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", validateRepositoryId, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = response.locals.repositoryIndex;

  const { likes } = repositories[repositoryIndex];

  const repository = {
    id,
    title,
    url,
    techs,
    likes,
  };

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", validateRepositoryId, (request, response) => {

  const repositoryIndex = response.locals.repositoryIndex

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", validateRepositoryId, (request, response) => {

  const repository = repositories[response.locals.repositoryIndex];

  repository.likes += 1;

  return response.status(200).json(repository);
});

module.exports = app;
