import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialService } from '../../services/material.service';
import { Material } from '../../models/material.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-material-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './material-master.component.html',
  styleUrls: ['./material-master.component.css']
})
export class MaterialMasterComponent implements OnInit {
  materials: Material[] = [];

  materialNames: string[] = ['Cotton', 'Linen', 'Polyester', 'Denim', 'Lycra', 'Satin', 'Flannel', 'Lyocell'];
  colorOptions: string[] = ['Red', 'Blue', 'Green', 'Black', 'White'];
  patternOptions: string[] = ['Solid', 'Striped', 'Checked', 'Floral', 'Geometric'];

  newMaterial: Partial<Material> = {
    Material_Desc: '',
    Quantity: undefined,
    Color: '',
    Price: undefined,
    Pattern: '',
    Purchase_Date: '',
    Comments: ''
  };

  errors: { [key: string]: string } = {};
  editMode = false;
  selectedMaterialId: number | null = null;

  constructor(private materialService: MaterialService, private router: Router) {}

  ngOnInit() {
    this.loadMaterials();
  }

  loadMaterials() {
    this.materialService.getMaterials().subscribe({
      next: (res) => this.materials = res,
      error: (err) => console.error('Failed to load materials', err)
    });
  }

  addMaterial() {
  this.errors = {};

  if (!this.newMaterial['Material_Desc']) {
    this.errors['Material_Desc'] = 'Material description is required';
  }
  if (!this.newMaterial['Quantity'] || this.newMaterial['Quantity']! <= 0) {
    this.errors['Quantity'] = 'Quantity must be greater than 0';
  }
  if (!this.newMaterial['Color']) {
    this.errors['Color'] = 'Color is required';
  }
  if (!this.newMaterial['Price'] || this.newMaterial['Price']! <= 0) {
    this.errors['Price'] = 'Price must be greater than 0';
  }
  if (!this.newMaterial['Pattern']) {
    this.errors['Pattern'] = 'Pattern is required';
  }
  if (!this.newMaterial['Purchase_Date']) {
    this.errors['Purchase_Date'] = 'Purchase date is required';
  } else {
    const purchaseDate = new Date(this.newMaterial['Purchase_Date']);
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);

    if (isNaN(purchaseDate.getTime())) {
      this.errors['Purchase_Date'] = 'Invalid purchase date.';
    } else if (purchaseDate > today) {
      this.errors['Purchase_Date'] = 'Purchase date cannot be in the future.';
    } else if (purchaseDate < twoWeeksAgo) {
      this.errors['Purchase_Date'] = 'Purchase date cannot be more than 2 weeks old.';
    }
  }

  if (Object.keys(this.errors).length > 0) return;

  this.materialService.createMaterial(this.newMaterial as Material).subscribe({
    next: () => {
      this.resetForm();
      this.loadMaterials();
    },
    error: (err) => console.error('Failed to add material', err)
  });
}



  editMaterial(material: Material) {
    this.editMode = true;
    this.selectedMaterialId = material.Material_Id || null;
    this.newMaterial = { ...material };
    this.errors = {};
  }

  updateMaterial() {
    if (this.selectedMaterialId === null) return;

    this.materialService.updateMaterial(this.selectedMaterialId, this.newMaterial as Material).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadMaterials();
      },
      error: (err) => console.error('Failed to update material', err)
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedMaterialId = null;
    this.resetForm();
  }

  private resetForm() {
    this.newMaterial = {
      Material_Desc: '',
      Quantity: 0,
      Color: '',
      Price: 0,
      Pattern: '',
      Purchase_Date: '',
      Comments: ''
    };
    this.errors = {};
  }

  printTable(): void {
    const printContents = document.getElementById('materialPrintArea')?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open('', '', 'width=1000,height=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Material Details</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              h3 {
                text-align: center;
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid black;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
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
