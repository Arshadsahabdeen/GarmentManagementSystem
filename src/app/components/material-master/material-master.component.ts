import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialService } from '../../services/material.service';
import { Material } from '../../models/material.model';
import { HomeComponent } from '../home/home.component';
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

  // Initialize with required fields only, other fields optional
  newMaterial: Partial<Material> = {
    Material_Desc: '',
    Quantity: 0,
    Color: '',
    Price: 0,
    Pattern: '',
    Purchase_Date: '',
    Comments: ''
  };

  editMode = false;
  selectedMaterialId: number | null = null;

  constructor(private materialService: MaterialService,private router:Router) {}

  ngOnInit() {
    this.loadMaterials();
  }

  loadMaterials() {
    this.materialService.getMaterials().subscribe({
      next: (res) => {
        this.materials = res;
      },
      error: (err) => {
        console.error('Failed to load materials', err);
      }
    });
  }

  addMaterial() {
    if (!this.newMaterial.Material_Desc) {
      alert('Material description is required');
      return;
    }

    this.materialService.createMaterial(this.newMaterial as Material).subscribe({
      next: () => {
        this.resetForm();
        this.loadMaterials();
      },
      error: (err) => {
        console.error('Failed to add material', err);
      }
    });
  }

  editMaterial(material: Material) {
    this.editMode = true;
    this.selectedMaterialId = material.Material_Id || null;
    // Copy values for editing
    this.newMaterial = { ...material };
  }

  updateMaterial() {
    if (this.selectedMaterialId === null) return;

    this.materialService.updateMaterial(this.selectedMaterialId, this.newMaterial as Material).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadMaterials();
      },
      error: (err) => {
        console.error('Failed to update material', err);
      }
    });
  }

  deleteMaterial(id: number) {
    this.materialService.deleteMaterial(id).subscribe({
      next: () => this.loadMaterials(),
      error: (err) => console.error('Failed to delete material', err)
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
  }
  goHome() {
    this.router.navigate(['/home']);
  }
}
