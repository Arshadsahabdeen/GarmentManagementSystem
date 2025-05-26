export interface Dispatch {
  Dispatch_Id: number;
  Stitching_Details_Id: number;
  Dispatch_Date: string; // ISO format string (e.g., '2025-05-24')
  Quantity_Dispatched: number;
  Price: number;
  Receiver_Name: string;
  Dispatch_Status: string;
  Remarks: string;
  Entry_Date: string; // ISO format string
  Modified_Date: string; // ISO format string
}
