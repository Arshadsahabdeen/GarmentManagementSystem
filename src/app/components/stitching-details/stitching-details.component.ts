import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StitchingDetailsService } from '../../services/stitching-details.service';
import { StitchingDetails } from '../../models/stitching-details.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stitching-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stitching-details.component.html',
  styleUrls: ['./stitching-details.component.css']
})
export class StitchingDetailsComponent implements OnInit {
  stitchingDetailsList: StitchingDetails[] = [];

  newDetails: Partial<StitchingDetails> = {
    Material_Process_Id: 0,
    Size: 0,
    Stitching_Date: '',
    Stitching_Status: false,
    Quantity_Stitched: 0,
    Tailor_Id: 0,
    Quality_Check_Status: false
  };

  editMode = false;
  selectedId: number | null = null;

  constructor(private sdService: StitchingDetailsService, private router: Router) {}

  ngOnInit(): void {
    this.loadStitchingDetails();
  }

  loadStitchingDetails() {
    this.sdService.getAll().subscribe({
      next: (res) => this.stitchingDetailsList = res,
      error: (err) => console.error('Error loading details', err)
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
}
