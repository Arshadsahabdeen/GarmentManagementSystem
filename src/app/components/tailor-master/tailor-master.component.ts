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
  printTable(): void {
  const printContents = document.getElementById('tailorPrintArea')?.innerHTML;
  if (!printContents) return;
  const printWindow = window.open('', '', 'width=1000,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Tailor Master</title>
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
