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

  validationErrors: { [key: string]: string } = {};
  shakeFields: { [key: string]: boolean } = {};

  constructor(private tailorService: TailorService, private router: Router) {}

  ngOnInit(): void {
    this.fetchTailors();
  }

  fetchTailors() {
    this.tailorService.getAllTailors().subscribe(data => {
      this.tailorList = data;
    });
  }

  validateForm(): boolean {
  this.validationErrors = {};
  let isValid = true;

  if (!this.newTailor.Tailor_Name || this.newTailor.Tailor_Name.trim() === '') {
  this.validationErrors['Tailor_Name'] = 'Name is required.';
  this.triggerShake('Tailor_Name');
  isValid = false;
} else if (!/^[a-zA-Z ]{2,}$/.test(this.newTailor.Tailor_Name)) {
  this.validationErrors['Tailor_Name'] = 'Enter a valid name (letters and spaces only).';
  this.triggerShake('Tailor_Name');
  isValid = false;
}
  if (this.newTailor.Age == null || this.newTailor.Age === 0) {
  this.validationErrors['Age'] = 'Valid age is required.';
  this.triggerShake('Age');
  isValid = false;
} else if (this.newTailor.Age < 18) {
  this.validationErrors['Age'] = 'Age must be at least 18.';
  this.triggerShake('Age');
  isValid = false;
}

  if (!this.newTailor.Gender.trim()) {
    this.validationErrors['Gender'] = 'Gender is required.';
    this.triggerShake('Gender');
    isValid = false;
  }
  if (!this.newTailor.Contact || this.newTailor.Contact.trim() === '') {
  this.validationErrors['Contact'] = 'Contact number is required.';
  this.triggerShake('Contact');
  isValid = false;
} else if (!/^[6-9]\d{9}$/.test(this.newTailor.Contact)) {
  this.validationErrors['Contact'] = 'Enter a valid 10-digit contact number.';
  this.triggerShake('Contact');
  isValid = false;
}
  
  if (!this.newTailor.Experience || this.newTailor.Experience < 0) {
    this.validationErrors['Experience'] = 'Experience must be 0 or more.';
    this.triggerShake('Experience');
    isValid = false;
  }
  if (!this.newTailor.Address || this.newTailor.Address.trim().length < 10) {
  this.validationErrors['Address'] = 'Address must be at least 10 characters.';
  this.triggerShake('Address');
  isValid = false;
} else if (!/^[a-zA-Z0-9\s,.\-#]{10,250}$/.test(this.newTailor.Address.trim())) {
  this.validationErrors['Address'] = 'Address contains invalid characters.';
  this.triggerShake('Address');
  isValid = false;
}

  if (!this.newTailor.Date_of_Joining) {
    this.validationErrors['Date_of_Joining'] = 'Joining date is required.';
    this.triggerShake('Date_of_Joining');
    isValid = false;
  }

  return isValid;
}
onDateChange(): void {
  const joiningDate = new Date(this.newTailor.Date_of_Joining);
  const today = new Date();

  if (isNaN(joiningDate.getTime())) {
    this.newTailor.Experience = 0;
    return;
  }

  let experience = today.getFullYear() - joiningDate.getFullYear();
  const monthDiff = today.getMonth() - joiningDate.getMonth();
  const dayDiff = today.getDate() - joiningDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    experience--;
  }

  this.newTailor.Experience = experience >= 0 ? experience : 0;
}


triggerShake(field: string) {
  this.shakeFields[field] = true;
  setTimeout(() => (this.shakeFields[field] = false), 500);
}

  addTailor() {
  if (!this.validateForm()) return;
  this.tailorService.addTailor(this.newTailor).subscribe(() => {
    this.fetchTailors();
    this.resetForm();
  });
}

updateTailor() {
  if (!this.validateForm() || this.editingId === null) return;
  this.tailorService.updateTailor(this.editingId, this.newTailor).subscribe(() => {
    this.fetchTailors();
    this.cancelEdit();
  });
}

resetForm() {
  this.newTailor = {
    Tailor_Name: '',
    Age: 0,
    Gender: '',
    Contact: '',
    Experience: 0,
    Address: '',
    Date_of_Joining: ''
  };
  this.validationErrors = {};
  this.shakeFields = {};
}

  editTailor(tailor: Tailor) {
    this.editMode = true;
    this.editingId = tailor.Tailor_Id!;
    this.newTailor = { ...tailor };
  }

  // deleteTailor(id: number) {
  //   this.tailorService.deleteTailor(id).subscribe(() => {
  //     this.fetchTailors();
  //   });
  // }

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
