const axios = require("axios");

const GITHUB_USERNAME = "aabha4747-art";

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "Portfolio-CMS",
  },
});

// Get all public repositories
const getRepositories = async () => {
  const response = await githubApi.get(
    `/users/${GITHUB_USERNAME}/repos`,
    {
      params: {
        sort: "updated",
        direction: "desc",
        per_page: 100,
      },
    }
  );

  return response.data;
};

// Get one repository
const getRepository = async (repoName) => {
  const response = await githubApi.get(
    `/repos/${GITHUB_USERNAME}/${repoName}`
  );

  return response.data;
};

module.exports = {
  getRepositories,
  getRepository,
};