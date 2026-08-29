export interface LetterData {
  text: string;
  sender: string;
  sealColor: string;
  deliverAt: number;
}

export interface HistoryItem {
  id: string;
  dateSent: number;
  textPreview: string;
  url: string;
}
