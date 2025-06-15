import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DispatchService } from '../../services/dispatch.service';
import { StitchingDetailsService } from '../../services/stitching-details.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dispatch',
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './dispatch-details.component.html',
  styleUrls: ['./dispatch-details.component.css'],
  standalone: true
})
export class DispatchComponent implements OnInit {
  dispatches: any[] = [];
  newDispatch: any = {
  Stitching_Details_Id: null,
  Dispatch_Date: '',               // should be a valid 'YYYY-MM-DD' date string
  Quantity_Dispatched: null,       // int
  Price: null,                     // float
  Receiver_Name: '',              // string
  Dispatch_Status: false,         // boolean
  Remarks: ''                     // optional
};

  editMode = false;

  selectedStitchingId: number | null = null;
stitchingDropdownOptions: any[] = [];

validationErrors: { [key: string]: string } = {};
shakeFields: { [key: string]: boolean } = {};
  @ViewChild('tableToPrint') tableToPrint!: ElementRef;

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    private snackBar: MatSnackBar,
    private stitchingDetailService: StitchingDetailsService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDispatches();
    this.loadStitchingOptions();
  }

  loadDispatches(): void {
    this.dispatchService.getAllDispatches().subscribe(data => {
      this.dispatches = data;
    });
  }

  loadStitchingOptions() {
  this.http.get<any[]>('https://garmentmanagementsystem-backend.onrender.com/stitching-details/dropdown-options')
    .subscribe({
      next: (data) => {
        this.stitchingDropdownOptions = data;
      },
      error: (error) => {
        console.error('Error loading dropdown options:', error);
      }
    });
}

validateDispatchForm(): boolean {
  this.validationErrors = {};
  this.shakeFields = {};
  const selectedOption = this.stitchingDropdownOptions.find(opt => opt.Stitching_Details_Id === this.selectedStitchingId);
  if (!this.selectedStitchingId) {
    this.validationErrors['Stitching_Details_Id'] = 'Please select stitched material.';
    this.shakeFields['Stitching_Details_Id'] = true;
  }

  if (!this.newDispatch.Dispatch_Date) {
    this.validationErrors['Dispatch_Date'] = 'Dispatch date is required.';
    this.shakeFields['Dispatch_Date'] = true;
  }

  if (this.newDispatch.Quantity_Dispatched == null || this.newDispatch.Quantity_Dispatched <= 0) {
  this.validationErrors['Quantity_Dispatched'] = 'Quantity must be greater than zero.';
  this.shakeFields['Quantity_Dispatched'] = true;
} else if (selectedOption && this.newDispatch.Quantity_Dispatched > selectedOption.Quantity_Stitched) {
  this.validationErrors['Quantity_Dispatched'] = 'Quantity cannot exceed available stock.';
  this.shakeFields['Quantity_Dispatched'] = true;
} else {
  // Clear error if valid
  delete this.validationErrors['Quantity_Dispatched'];
  this.shakeFields['Quantity_Dispatched'] = false;
}

  if (!this.newDispatch.Price || this.newDispatch.Price <= 0) {
    this.validationErrors['Price'] = 'Enter a valid price.';
    this.shakeFields['Price'] = true;
  }

  if (!this.newDispatch.Receiver_Name?.trim()) {
    this.validationErrors['Receiver_Name'] = 'Receiver name is required.';
    this.shakeFields['Receiver_Name'] = true;
  }

  if (this.newDispatch.Dispatch_Status === null || this.newDispatch.Dispatch_Status === undefined) {
    this.validationErrors['Dispatch_Status'] = 'Please select status.';
    this.shakeFields['Dispatch_Status'] = true;
  }

  // Remove shake effect after animation
  setTimeout(() => {
    this.shakeFields = {};
  }, 300);

  return Object.keys(this.validationErrors).length === 0;
}

setError(field: string, message: string): void {
  this.validationErrors[field] = message;
  this.shakeFields[field] = true;
  setTimeout(() => this.shakeFields[field] = false, 500);
}


  addDispatch(): void {
  if (this.selectedStitchingId == null) {
    alert('Please select a Stitching Detail before dispatching.');
    return;
  }

  this.newDispatch.Stitching_Details_Id = +this.selectedStitchingId;

  // Force boolean type for Dispatch_Status
  this.newDispatch.Dispatch_Status = this.newDispatch.Dispatch_Status === 'true' || this.newDispatch.Dispatch_Status === true;

  if (!this.validateDispatchForm()) return;

  this.dispatchService.createDispatch(this.newDispatch).subscribe({
    next: () => {
      this.loadDispatches();
      this.newDispatch = {
        Stitching_Details_Id: null,
        Dispatch_Date: '',
        Quantity_Dispatched: null,
        Price: null,
        Receiver_Name: '',
        Dispatch_Status: false,
        Remarks: ''
      };
    },
    error: (err) => {
      console.error('Dispatch error:', err);
    }
  });
}




updateDispatch(): void {
  if (!this.validateDispatchForm()) return;

  this.dispatchService.updateDispatch(this.newDispatch.Dispatch_Id, this.newDispatch).subscribe({
    next: () => {
      this.loadDispatches();
      this.newDispatch = {};
      this.editMode = false;
    },
    error: (error) => {
      console.error('Update error:', error);
      // Optionally, handle 400/422 errors if you want to display additional messages
    }
  });
}


  editDispatch(dispatch: any): void {
    this.newDispatch = { ...dispatch };
    this.editMode = true;
  }

  // deleteDispatch(id: number): void {
  //   this.dispatchService.deleteDispatch(id).subscribe(() => {
  //     this.loadDispatches();
  //   });
  // }

  cancelEdit(): void {
  this.newDispatch = {};
  this.editMode = false;
  this.validationErrors = {};
  this.shakeFields = {};
}
  
  printTable(): void {
  const printContents = document.getElementById('dispatchPrintArea')?.innerHTML;
  if (!printContents) return;

  const printWindow = window.open('', '', 'width=1000,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Dispatch Details</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
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