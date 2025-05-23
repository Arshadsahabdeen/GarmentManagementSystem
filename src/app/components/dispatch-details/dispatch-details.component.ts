import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DispatchService } from '../../services/dispatch.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dispatch',
  imports: [CommonModule, FormsModule],
  templateUrl: './dispatch-details.component.html',
  styleUrls: ['./dispatch-details.component.css'],
  standalone: true
})
export class DispatchComponent implements OnInit {
  dispatches: any[] = [];
  newDispatch: any = {};
  editMode = false;

  constructor(private dispatchService: DispatchService, private router: Router) {}

  ngOnInit(): void {
    this.loadDispatches();
  }

  loadDispatches(): void {
    this.dispatchService.getAllDispatches().subscribe(data => {
      this.dispatches = data;
    });
  }

  addDispatch(): void {
    this.dispatchService.createDispatch(this.newDispatch).subscribe(() => {
      this.loadDispatches();
      this.newDispatch = {};
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
}
