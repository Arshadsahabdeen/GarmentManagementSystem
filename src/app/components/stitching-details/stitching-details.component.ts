import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StitchingDetailsService } from '../../services/stitching-details.service';
import { StitchingDetails } from '../../models/stitching-details.model';
import { Router } from '@angular/router';
import { MaterialProcessService } from '../../services/material-process.service';
import { TailorService } from '../../services/tailor.service';

@Component({
  selector: 'app-stitching-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stitching-details.component.html',
  styleUrls: ['./stitching-details.component.css']
})
export class StitchingDetailsComponent implements OnInit {
  stitchingDetailsList: StitchingDetails[] = [];

  materialProcessOptions: { id: number; qty: number }[] = [];

  newDetails: any = {
    Material_Process_Id: null,
    Size: 0,
    Stitching_Date: '',
    Stitching_Status: false,
    Quantity_Stitched: 0,
    Tailor_Id: null,
    Quality_Check_Status: false
  };

  editMode = false;
  selectedId: number | null = null;

  constructor(private sdService: StitchingDetailsService, private tailorService: TailorService, private materialProcessService: MaterialProcessService, private router: Router) {}

  ngOnInit(): void {
    this.loadStitchingDetails();
    this.loadMaterialProcessOptions();
    this.loadTailorOptions();

  }

  loadStitchingDetails() {
    this.sdService.getAll().subscribe({
      next: (res) => this.stitchingDetailsList = res,
      error: (err) => console.error('Error loading details', err)
    });
  }
  tailorOptions: { id: number; name: string }[] = [];

loadTailorOptions() {
  this.tailorService.getDropdownOptions().subscribe({
    next: (res) => this.tailorOptions = res,
    error: (err) => console.error('Failed to load tailor options', err)
  });
}

  loadMaterialProcessOptions() {
 this.materialProcessService.getMaterialProcessDropdownOptions().subscribe({
  next: (res) => {
    console.log('Material Process options:', res);  // ✅ Add this
    this.materialProcessOptions = res.map((item: any) => ({
      id: item.Material_Process_Id,
      qty: item.Quantity_Processed
    }));
  },
  error: (err) => {
    console.error('Failed to load material process options', err);
  }
});
  }

  addDetail() {
    this.sdService.create(this.newDetails as StitchingDetails).subscribe({
      next: () => {
        this.resetForm();
        this.loadStitchingDetails();
      },
      error: (err) => console.error('Add error', err)
    });
  }

  editDetail(sd: StitchingDetails) {
    this.editMode = true;
    this.selectedId = sd.Stitching_Details_Id || null;
    this.newDetails = { ...sd };
  }

  updateDetail() {
    if (!this.selectedId) return;

    this.sdService.update(this.selectedId, this.newDetails as StitchingDetails).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadStitchingDetails();
      },
      error: (err) => console.error('Update error', err)
    });
  }

  deleteDetail(id: number) {
    this.sdService.delete(id).subscribe({
      next: () => this.loadStitchingDetails(),
      error: (err) => console.error('Delete error', err)
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedId = null;
    this.resetForm();
  }

  resetForm() {
    this.newDetails = {
      Material_Process_Id: 0,
      Size: 0,
      Stitching_Date: '',
      Stitching_Status: false,
      Quantity_Stitched: 0,
      Tailor_Id: 0,
      Quality_Check_Status: false
    };
  }

  goHome() {
    this.router.navigate(['/home']);
  }
  onSizeChange() {
   this.newDetails.Quantity_Stitched = this.calculateQuantityStitched(this.newDetails.Size as number);
  }
  calculateQuantityStitched(size: number): number {
    if (!size || size <= 0) return 0;
    return size / 2;
  }
  printTable(): void {
  const printContents = document.getElementById('stitchingPrintArea')?.innerHTML;
  if (!printContents) return;
  const printWindow = window.open('', '', 'width=1000,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Stitching Details</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h3 { text-align: center; }
          </style>
        </head>
        <body onload="window.print();">
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  }
}

}
