import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './services/auth.guard';
import { MaterialMasterComponent } from './components/material-master/material-master.component';
import { MaterialProcessComponent } from './components/material-process/material-process.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'materials', component: MaterialMasterComponent },
  { path: 'material-process', component: MaterialProcessComponent}
];
