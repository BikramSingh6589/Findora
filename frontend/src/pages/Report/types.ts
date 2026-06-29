export interface ReportFormData {
  itemName: string;
  category: string;
  foundDate: string;
  foundTime: string;
  location: string;
  color: string;
  brand: string;
  description: string;
}

export interface LostFormData {
  itemName: string;
  category: string;
  lastSeenLocation: string;
  lostDateTime: string;
  description: string;
  color: string;
  brand: string;
}
