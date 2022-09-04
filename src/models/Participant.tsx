import type { DBPhone } from './Phone';

const DB_PATH = 'participants';
export const getParticipantRef = (id: string) => `${DB_PATH}/${id}`;

export type DBParticipant = {
  id: string;
  active: boolean;
  phone?: DBPhone;
  email?: string;
  displayName?: string;
};
