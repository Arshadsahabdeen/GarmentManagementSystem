import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialProcessService } from '../../services/material-process.service';
import { MaterialService } from '../../services/material.service';
import { MaterialProcess } from '../../models/material-process.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-material-process',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './material-process.component.html',
  styleUrls: ['./material-process.component.css']
})
export class MaterialProcessComponent implements OnInit {
  materialProcesses: MaterialProcess[] = [];

  // Validation related state
  validationErrors: { [key: string]: string } = {};
  shakeFields: { [key: string]: boolean } = {};

  materialOptions: { Material_Id: number; description: string; color: string; qty: number }[] = [];

  newMaterialProcess: any = {
    Material_Id: '',
    Quantity_Processed: 0,
    Processed_Date: ''
  };

  editMode = false;
  selectedProcessId: number | null = null;

  constructor(
    private materialProcessService: MaterialProcessService,
    private materialService: MaterialService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMaterialProcesses();
    this.loadMaterialOptions();
  }

  loadMaterialProcesses() {
  this.materialProcessService.getAll().subscribe({
    next: (res) => {
      this.materialProcesses = res;
    },
    error: (err) => {
      console.error('Failed to load material processes', err);
    }
  });
}
    

  loadMaterialOptions() {
    this.materialService.getMaterialDropdownOptions().subscribe({
      next: (res) => {
        this.materialOptions = res;
      },
      error: (err) => {
        console.error('Failed to load material options', err);
      }
    });
  }

  getAvailableQuantity(): number {
  const selectedMaterial = this.materialOptions.find(
    (mat) => mat.Material_Id === +this.newMaterialProcess.Material_Id
  );
  return selectedMaterial ? selectedMaterial.qty : 0;
}


  setValidationError(field: string, message: string) {
    this.validationErrors[field] = message;
    this.shakeFields[field] = true;
    setTimeout(() => (this.shakeFields[field] = false), 600);
  }

  clearValidationErrors() {
    this.validationErrors = {};
    this.shakeFields = {};
  }

  addMaterialProcess() {
  this.clearValidationErrors();
  let hasError = false;

  if (!this.newMaterialProcess.Material_Id) {
  this.setValidationError('Material_Id', 'Material is required');
  hasError = true;
} else {
  this.newMaterialProcess.Material_Id = parseInt(this.newMaterialProcess.Material_Id as any, 10);
}

  if (!this.newMaterialProcess.Processed_Date) {
    this.setValidationError('Processed_Date', 'Processed Date is required');
    hasError = true;
  }

  const availableQty = this.getAvailableQuantity();
  const qty = this.newMaterialProcess.Quantity_Processed;

  if (!qty || qty <= 0) {
    this.setValidationError('Quantity_Processed', 'Quantity must be greater than zero');
    hasError = true;
  } else if (qty > availableQty) {
    this.setValidationError(
      'Quantity_Processed',
      `Quantity cannot exceed available (${availableQty})`
    );
    hasError = true;
  }

  if (hasError) return;

  this.materialProcessService.create(this.newMaterialProcess as MaterialProcess).subscribe({
    next: () => {
      this.resetForm();
      this.loadMaterialProcesses();
    },
    error: (err) => {
      console.error('Error response:', err);
      alert('Failed to add material process: ' + (err?.error?.detail || 'Unknown error'));
    }
  });
}

  resetForm() {
    this.newMaterialProcess = {
      Material_Id: 0,
      Quantity_Processed: 0,
      Processed_Date: ''
    };
    this.clearValidationErrors();
    this.editMode = false;
    this.selectedProcessId = null;
  }

  editMaterialProcess(mp: MaterialProcess) {
    this.editMode = true;
    this.selectedProcessId = mp.Material_Process_Id || null;
    this.newMaterialProcess = { ...mp };
    this.clearValidationErrors();
  }

  updateMaterialProcess() {
  if (this.selectedProcessId === null) return;

  this.clearValidationErrors();
  let hasError = false;

  const availableQty = this.getAvailableQuantity();
  const qty = this.newMaterialProcess.Quantity_Processed;

  if (!qty || qty <= 0) {
    this.setValidationError('Quantity_Processed', 'Quantity must be greater than zero');
    hasError = true;
  } else if (qty > availableQty) {
    this.setValidationError(
      'Quantity_Processed',
      `Quantity cannot exceed available (${availableQty})`
    );
    hasError = true;
  }

  if (!this.newMaterialProcess.Material_Id) {
    this.setValidationError('Material_Id', 'Material is required');
    hasError = true;
  }

  if (!this.newMaterialProcess.Processed_Date) {
    this.setValidationError('Processed_Date', 'Processed Date is required');
    hasError = true;
  }

  if (hasError) return;

  this.materialProcessService.update(this.selectedProcessId, this.newMaterialProcess as MaterialProcess).subscribe({
    next: () => {
      this.cancelEdit();
      this.loadMaterialProcesses();
    },
    error: (err) => {
      console.error('Failed to update material process', err);
    }
  });
}

cancelEdit() {
    this.editMode = false;
    this.selectedProcessId = null;
    this.resetForm();
  }
  goHome() {
    this.router.navigate(['/home']);
  }

  printTable(): void {
    const printContents = document.getElementById('materialProcessPrintArea')?.innerHTML;
    if (!printContents) return;
    const printWindow = window.open('', '', 'width=1000,height=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Material Process</title>
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
