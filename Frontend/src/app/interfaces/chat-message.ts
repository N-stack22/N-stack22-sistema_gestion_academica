export interface ChatMessage {
  id: number;
  from: 'bot' | 'user';
  text: string;
  time: string;
}
