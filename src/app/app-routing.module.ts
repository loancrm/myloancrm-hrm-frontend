import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { SsoAuthComponent } from './sso-auth/sso-auth.component';
import { CustomtemplateComponent } from './admin/customtemplate/customtemplate.component';
const routes: Routes = [
  // { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '', redirectTo: '/user', pathMatch: 'full' },
  {
    path: 'user',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard],
  },
  // {
  //   path: 'user/login',
  //   loadChildren: () =>
  //     import('./login/login.module').then((m) => m.LoginModule),
  // },
  {
    path: 'employee',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard],
  },
  {
    path: ':usertype/login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginModule),
  },
  // {
  //   path: '**',
  //   redirectTo: 'not-found',
  //   pathMatch: 'full',
  // },
  { path: "sso-auth", component: SsoAuthComponent },

  {
  path: 'user/customtemplate',
  component: CustomtemplateComponent
}


];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
