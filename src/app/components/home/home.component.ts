import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  dropdownOpen = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService

  ) {}

  ngOnInit() {}

  
  goTo(path: string) {
    if (path === 'reports') {
      this.router.navigate(['/reports']);
    } else {
      this.router.navigate(['/home', path]);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  goToProfile() {
    console.log('Navigating to profile...');
    this.dropdownOpen = false;
  }
}
