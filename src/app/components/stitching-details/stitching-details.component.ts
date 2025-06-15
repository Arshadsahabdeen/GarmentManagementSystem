import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { StitchingDetailsService } from '../../services/stitching-details.service';
import { MaterialProcessService } from '../../services/material-process.service';
import { TailorService } from '../../services/tailor.service';

import { StitchingDetails } from '../../models/stitching-details.model';

@Component({
  selector: 'app-stitching-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stitching-details.component.html',
  styleUrls: ['./stitching-details.component.css']
})
export class StitchingDetailsComponent implements OnInit {
  stitchingDetailsList: StitchingDetails[] = [];
  selectedMaterialQty: number = 0;
  materialProcessOptions: { id: number; description: string; color: string; qty: number }[] = [];
  tailorOptions: { id: number; name: string }[] = [];

  newDetails: any = {
    Material_Process_Id: '',
    Size: 0,
    Stitching_Date: '',
    Stitching_Status: false,
    Quantity_Stitched: 0,
    Tailor_Id: null,
    Quality_Check_Status: false
  };

  validationErrors: { [key: string]: string } = {};
  shakeFields: { [key: string]: boolean } = {};

  editMode = false;
  selectedId: number | null = null;

  constructor(
    private sdService: StitchingDetailsService,
    private tailorService: TailorService,
    private materialProcessService: MaterialProcessService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStitchingDetails();
    this.loadMaterialProcessOptions();
    this.loadTailorOptions();
  }

  loadStitchingDetails() {
    this.sdService.getAll().subscribe({
      next: (res) => (this.stitchingDetailsList = res),
      error: (err) => console.error('Error loading stitching details:', err)
    });
  }

  loadMaterialProcessOptions() {
    this.materialProcessService.getMaterialProcessDropdownOptions().subscribe({
      next: (res) => {
        this.materialProcessOptions = res.map((item: any) => ({
          id: item.Material_Process_Id,
          qty: item.Quantity_Processed,
          description: item.Material_Desc,
          color: item.Color
        }));
      },
      error: (err) => console.error('Failed to load material process options', err)
    });
  }

  loadTailorOptions() {
    this.tailorService.getDropdownOptions().subscribe({
      next: (res) => (this.tailorOptions = res),
      error: (err) => console.error('Failed to load tailor options', err)
    });
  }

  // --- Form Validation ---
  setValidationError(field: string, message: string) {
    this.validationErrors[field] = message;
    this.shakeFields[field] = true;
    setTimeout(() => (this.shakeFields[field] = false), 600);
  }

  clearValidationErrors() {
    this.validationErrors = {};
    this.shakeFields = {};
  }
  onMaterialProcessChange() {
  const selected = this.materialProcessOptions.find(
    item => item.id === this.newDetails.Material_Process_Id
  );
  this.selectedMaterialQty = selected ? selected.qty : 0;
}
onSizeInputChange() {
  if (this.newDetails.Size > this.selectedMaterialQty) {
    this.newDetails.Size = this.selectedMaterialQty;
  }

  // Auto-calculate Quantity_Stitched = Size * 2
  const size = this.newDetails.Size;
  this.newDetails.Quantity_Stitched = (size && size > 0) ? size * 2 : 0;
}

validateStitchingForm(): boolean {
  this.validationErrors = {};
  this.shakeFields = {};
  const d = this.newDetails;

  if (!d.Material_Process_Id) {
    this.setError('Material_Process_Id', 'Processed material is required.');
  }
  if (!d.Size || d.Size <= 0) {
    this.setError('Size', 'Valid size is required.');
  }
  if (d.Size > this.selectedMaterialQty) {
  this.setError('Size', `Size cannot exceed available quantity (${this.selectedMaterialQty} m).`);
}

  if (!d.Stitching_Date) {
    this.setError('Stitching_Date', 'Stitching date is required.');
  }
  if (d.Stitching_Status === undefined || d.Stitching_Status === null) {
    this.setError('Stitching_Status', 'Status is required.');
  }
  if (!d.Quantity_Stitched || d.Quantity_Stitched <= 0) {
    this.setError('Quantity_Stitched', 'Quantity is required.');
  }
  if (!d.Tailor_Id) {
    this.setError('Tailor_Id', 'Tailor is required.');
  }
  if (d.Quality_Check_Status === undefined || d.Quality_Check_Status === null) {
    this.setError('Quality_Check_Status', 'Quality check status is required.');
  }

  return Object.keys(this.validationErrors).length === 0;
}
setError(field: string, message: string) {
  this.validationErrors[field] = message;
  this.shakeFields[field] = true;
  setTimeout(() => this.shakeFields[field] = false, 500);
}
  // --- Add new record ---
  addDetail() {
  this.clearValidationErrors();
  if (!this.validateStitchingForm()) return;

  // Ensure numeric types for IDs
  this.newDetails.Tailor_Id = +this.newDetails.Tailor_Id;
  this.newDetails.Material_Process_Id = +this.newDetails.Material_Process_Id;

  this.sdService.create(this.newDetails).subscribe({
    next: () => {
      this.resetForm();
      this.loadStitchingDetails();
    },
    error: (err) => console.error('Failed to add stitching detail:', err)
  });
}


updateDetail() {
  if (!this.selectedId) return;
  this.clearValidationErrors();
  if (!this.validateStitchingForm()) return;

  this.sdService.update(this.selectedId, this.newDetails).subscribe({
    next: () => {
      this.cancelEdit();
      this.loadStitchingDetails();
    },
    error: (err) => console.error('Failed to update stitching detail:', err)
  });
}

  
    // --- Edit record ---
    editDetail(sd: StitchingDetails) {
      this.editMode = true;
      this.selectedId = sd.Stitching_Details_Id || null;
      this.newDetails = { ...sd };
    }

  // --- Cancel edit ---
  cancelEdit() {
    this.editMode = false;
    this.selectedId = null;
    this.resetForm();
  }

  // --- Reset form to default ---
  resetForm() {
    this.newDetails = {
      Material_Process_Id: null,
      Size: 0,
      Stitching_Date: '',
      Stitching_Status: false,
      Quantity_Stitched: 0,
      Tailor_Id: null,
      Quality_Check_Status: false
    };
    this.clearValidationErrors();
  }

  // --- Navigate to Home ---
  goHome() {
    this.router.navigate(['/home']);
  }

  // --- Auto-calculate Quantity_Stitched when Size is changed ---
  onSizeChange() {
    this.newDetails.Quantity_Stitched = this.calculateQuantityStitched(this.newDetails.Size);
  }

  calculateQuantityStitched(size: number): number {
    if (!size || size <= 0) return 0;
    return size / 2;
  }

  // --- Print Table Content ---
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
