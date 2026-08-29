// app/types.ts

export interface LetterData {
  text: string;
  sender: string;
  sealColor: string;
  deliverAt: number;
  sentAt: number;
  distance: number;
}

export interface HistoryItem {
  id: string;
  dateSent: number;
  textPreview: string;
  url: string;
}