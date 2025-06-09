export interface MaterialProcess {
  Material_Process_Id?: number;
  Material_Id: number;
  Material_Desc: string;
  Color: string;
  Quantity_Processed: number;
  Processed_Date: string;  // ISO date string (YYYY-MM-DD)
  Entry_Date?: string;     // optional timestamps
  Modified_Date?: string;
}
