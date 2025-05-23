export interface StitchingDetails {
  Stitching_Details_Id?: number;
  Material_Process_Id: number;
  Size: number;
  Stitching_Date: string; // Format: 'YYYY-MM-DD'
  Stitching_Status: boolean;
  Quantity_Stitched: number;
  Tailor_Id: number;
  Quality_Check_Status: boolean;
}
