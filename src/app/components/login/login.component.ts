import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // ✅ Import Router
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {} // ✅ Inject Router

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.auth.saveToken(res.access_token);
        alert('Login successful!');
        this.router.navigate(['/home']); // ✅ Redirect to homepage
      },
      error: (err) => {
        this.error = err.error?.detail || 'Login failed';
      },
    });
  }
}
