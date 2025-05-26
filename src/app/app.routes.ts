import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './services/auth.guard';
import { MaterialMasterComponent } from './components/material-master/material-master.component';
import { MaterialProcessComponent } from './components/material-process/material-process.component';
import { StitchingDetailsComponent } from './components/stitching-details/stitching-details.component';
import { TailorComponent } from './components/tailor-master/tailor-master.component';
import { DispatchComponent } from './components/dispatch-details/dispatch-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'materials', pathMatch: 'full' },
      { path: 'materials', component: MaterialMasterComponent },
      { path: 'material-process', component: MaterialProcessComponent },
      { path: 'stitching-details', component: StitchingDetailsComponent },
      { path: 'tailors', component: TailorComponent },
      { path: 'dispatch', component: DispatchComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];

