import { Component, OnInit } from '@angular/core';
import { TailorService } from '../../services/tailor.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Tailor } from '../../models/tailor.model'; 
@Component({
  selector: 'app-tailor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tailor-master.component.html',
  styleUrls: ['./tailor-master.component.css']
})
export class TailorComponent implements OnInit {
  tailorList: Tailor[] = [];
  newTailor: Tailor = {
    Tailor_Name: '',
    Age: 0,
    Gender: '',
    Contact: '',
    Experience: 0,
    Address: '',
    Date_of_Joining: ''
  };
  editMode = false;
  editingId: number | null = null;

  constructor(private tailorService: TailorService, private router: Router) {}

  ngOnInit(): void {
    this.fetchTailors();
  }

  fetchTailors() {
    this.tailorService.getAllTailors().subscribe(data => {
      this.tailorList = data;
    });
  }

  addTailor() {
    this.tailorService.addTailor(this.newTailor).subscribe(() => {
      this.fetchTailors();
      this.newTailor = {
        Tailor_Name: '',
        Age: 0,
        Gender: '',
        Contact: '',
        Experience: 0,
        Address: '',
        Date_of_Joining: ''
      };
    });
  }

  editTailor(tailor: Tailor) {
    this.editMode = true;
    this.editingId = tailor.Tailor_Id!;
    this.newTailor = { ...tailor };
  }

  updateTailor() {
    if (this.editingId !== null) {
      this.tailorService.updateTailor(this.editingId, this.newTailor).subscribe(() => {
        this.fetchTailors();
        this.cancelEdit();
      });
    }
  }

  deleteTailor(id: number) {
    this.tailorService.deleteTailor(id).subscribe(() => {
      this.fetchTailors();
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.editingId = null;
    this.newTailor = {
      Tailor_Name: '',
      Age: 0,
      Gender: '',
      Contact: '',
      Experience: 0,
      Address: '',
      Date_of_Joining: ''
    };
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
