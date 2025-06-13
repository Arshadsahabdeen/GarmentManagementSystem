import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './services/auth.guard';
import { MaterialMasterComponent } from './components/material-master/material-master.component';
import { MaterialProcessComponent } from './components/material-process/material-process.component';
import { StitchingDetailsComponent } from './components/stitching-details/stitching-details.component';
import { TailorComponent } from './components/tailor-master/tailor-master.component';
import { DispatchComponent } from './components/dispatch-details/dispatch-details.component';

import { GeneralReportComponent } from './reports/general-report/general-report.component';
import { MaterialReportComponent } from './reports/material-report/material-report.component';
import { ProcessReportComponent } from './reports/process-report/process-report.component';
import { StitchingReportComponent } from './reports/stitching-report/stitching-report.component';
import { TailorReportComponent } from './reports/tailor-report/tailor-report.component';
import { DispatchReportComponent } from './reports/dispatch-report/dispatch-report.component';

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
      { path: 'dispatch', component: DispatchComponent }
    ]
  },

  {
  path: 'reports',
  component: GeneralReportComponent, // This includes the header/sidebar and <router-outlet>
  children: [
    { path: '', redirectTo: 'material', pathMatch: 'full' }, // Or whatever default
    { path: 'material', component: MaterialReportComponent },
    { path: 'process', component: ProcessReportComponent },
    { path: 'stitching', component: StitchingReportComponent },
    { path: 'tailor', component: TailorReportComponent },
    { path: 'dispatch', component: DispatchReportComponent }
  ]
}
,

  { path: '**', redirectTo: 'login' }
];
