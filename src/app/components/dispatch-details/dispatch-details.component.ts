import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DispatchService } from '../../services/dispatch.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dispatch',
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './dispatch-details.component.html',
  styleUrls: ['./dispatch-details.component.css'],
  standalone: true
})
export class DispatchComponent implements OnInit {
  dispatches: any[] = [];
  newDispatch: any = {};
  editMode = false;

  @ViewChild('tableToPrint') tableToPrint!: ElementRef;

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDispatches();
  }

  loadDispatches(): void {
    this.dispatchService.getAllDispatches().subscribe(data => {
      this.dispatches = data;
    });
  }

  addDispatch(): void {
    this.dispatchService.createDispatch(this.newDispatch).subscribe({
      next: () => {
        this.loadDispatches();
        this.newDispatch = {};
        this.snackBar.open('Dispatch added successfully!', 'Close', {
          duration: 3000,
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        console.error('Dispatch creation error:', error);
        if (error.status === 404 && error.error.detail === 'Stitching Details ID does not exist.') {
          this.snackBar.open('Error: Stitching Details ID does not exist.', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        } else if (error.status === 422) {
          this.snackBar.open('Please check the input fields for errors.', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        } else if (
          error.status === 400 &&
          error.error.detail === 'Not enough stitched quantity available for dispatch.'
        ) {
          this.snackBar.open('Error: Not enough stitched quantity available.', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        } else {
          this.snackBar.open('An unexpected error occurred.', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      }
    });
  }

  editDispatch(dispatch: any): void {
    this.newDispatch = { ...dispatch };
    this.editMode = true;
  }

  updateDispatch(): void {
    this.dispatchService.updateDispatch(this.newDispatch.Dispatch_Id, this.newDispatch).subscribe(() => {
      this.loadDispatches();
      this.newDispatch = {};
      this.editMode = false;
    });
  }

  deleteDispatch(id: number): void {
    this.dispatchService.deleteDispatch(id).subscribe(() => {
      this.loadDispatches();
    });
  }

  cancelEdit(): void {
    this.newDispatch = {};
    this.editMode = false;
  }

  goHome(): void {
    this.router.navigate(['/home']);
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