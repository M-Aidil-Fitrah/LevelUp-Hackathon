export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}
