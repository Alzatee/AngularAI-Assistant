import { Routes } from '@angular/router';
import { NotFoundPageComponent } from './layout/not-found-page/not-found-page.component';

export const routes: Routes = [
    {
        path: 'virtual-assistand',
        loadComponent: () => import('./components/virtual-assistand/virtual-assistand.component').then(c => c.VirtualAssistandComponent)
    },
    { path: '', redirectTo: 'virtual-assistand', pathMatch: 'full' },
    
    { path: '404', component: NotFoundPageComponent },
    { path: '**', redirectTo: '404' }
];
