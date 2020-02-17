import { dirname, resolve, basename, sep } from 'path';

export const resolveFromFile = (from: string, path: string) => {
  return resolveFromDirectory(dirname(from), path);
};

export const resolveFromDirectory = (from: string, path: string) => {
  return resolve(from, path);
};

export const getFileName = (path: string) => {
  const [fileName] = basename(path).split('.');
  return fileName;
};
