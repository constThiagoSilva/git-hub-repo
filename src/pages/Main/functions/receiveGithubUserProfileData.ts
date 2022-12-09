import { githubApi } from "../../../services/githubApi";
import { setMostUsedProgrammingLanguages } from "../utils/setMostUsedProgrammingLanguages";

export interface GithubUserData {
  name: string;
  username: string;
  avatar_url: string;
  biography: string;
  languages: string[];
  followers: number;
  following: number;
  repositories: number;
  stars: number;
}

export const receiveGithubUserProfileData = async (
  username: string
): Promise<{ githubData: GithubUserData | null; message: string | null }> => {
  const receivedUsernameProfilePromise = await githubApi.get<{
    login: string;
    name: string;
    avatar_url: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
    message?: string;
  }>(`users/${username}`);

  if (receivedUsernameProfilePromise.data.message) {
    return {
      message: receivedUsernameProfilePromise.data.message,
      githubData: null
    };
  }

  const receivedUsernameProgrammingLanguagesPromise = githubApi.get<
    [{ language: string }]
  >(`users/${username}/repos`);
  const receivedUsernameStarredPromise = githubApi.get<[]>(
    `users/${username}/repos`
  );

  const response = await Promise.all([
    receivedUsernameProgrammingLanguagesPromise,
    receivedUsernameStarredPromise,
  ]);

  return {
    githubData: {
      name: receivedUsernameProfilePromise.data.name,
      username: receivedUsernameProfilePromise.data.login,
      avatar_url: receivedUsernameProfilePromise.data.avatar_url,
      biography: receivedUsernameProfilePromise.data.bio,
      languages: setMostUsedProgrammingLanguages(response[0].data),
      followers: receivedUsernameProfilePromise.data.followers,
      following: receivedUsernameProfilePromise.data.following,
      repositories: receivedUsernameProfilePromise.data.public_repos,
      stars: response[1].data.length,
    },
    message: null
  };
};
