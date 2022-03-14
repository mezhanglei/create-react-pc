import { nanoid } from 'nanoid';

export const defaultGetId = (name: string) => {
  return `${name}_${nanoid(6)}`;
};
