import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './core/security/auth-guard.service';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { InitialPageComponent } from './home/initial-page/initial-page.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'home', component: HomeComponent,
    canActivate: [AuthGuard],
    children: [{
      path: '',
      redirectTo: '/home/initialPage',
      pathMatch: 'full',
      canActivate: [AuthGuard]
    },
    {
      path: 'initialPage',
      component: InitialPageComponent,
      canActivate: [AuthGuard]
    },
      // {
      //    path: 'etonamecomponentdataGrid',
      //    component: EtonamecomponentDataGridComponent,
      //    canActivate: [AuthGuard]
      // }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
