import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialProcessService } from '../../services/material-process.service';
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

  newMaterialProcess: Partial<MaterialProcess> = {
    Material_Id: 0,
    Quantity_Processed: 0,
    Processed_Date: ''
  };

  editMode = false;
  selectedProcessId: number | null = null;

  constructor(private materialProcessService: MaterialProcessService, private router: Router) {}

  ngOnInit() {
    this.loadMaterialProcesses();
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

  addMaterialProcess() {
    if (!this.newMaterialProcess.Material_Id || !this.newMaterialProcess.Processed_Date) {
      alert('Material Id and Processed Date are required');
      return;
    }

    this.materialProcessService.create(this.newMaterialProcess as MaterialProcess).subscribe({
      next: () => {
        this.resetForm();
        this.loadMaterialProcesses();
      },
      error: (err) => {
        console.error('Failed to add material process', err);
      }
    });
  }

  editMaterialProcess(mp: MaterialProcess) {
    this.editMode = true;
    this.selectedProcessId = mp.Material_Process_Id || null;
    this.newMaterialProcess = { ...mp };
  }

  updateMaterialProcess() {
    if (this.selectedProcessId === null) return;

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

  deleteMaterialProcess(id: number) {
    this.materialProcessService.delete(id).subscribe({
      next: () => this.loadMaterialProcesses(),
      error: (err) => console.error('Failed to delete material process', err)
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedProcessId = null;
    this.resetForm();
  }

  private resetForm() {
    this.newMaterialProcess = {
      Material_Id: 0,
      Quantity_Processed: 0,
      Processed_Date: ''
    };
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
