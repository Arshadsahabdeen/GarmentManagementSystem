import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  dropdownOpen = false;
  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {}
  goTo(path: string) {
    this.router.navigate([path], { relativeTo: this.route });
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}
  goToProfile() {
  // navigate to profile
  console.log('Navigating to profile...');
  this.dropdownOpen = false;
}
  // goToMaterials() {
  //   this.router.navigate(['/materials']);
  // }
  // goToMaterialProcesses() {
  //   this.router.navigate(['/material-process']);
  // }
  // goToStitchingDetails() {
  //   this.router.navigate(['/stitching-details']);
  // }
  // goToTailors() {
  //   this.router.navigate(['/tailors']);
  // }
  // goToDispatch() {
  //   this.router.navigate(['/dispatch']);
  // }
}