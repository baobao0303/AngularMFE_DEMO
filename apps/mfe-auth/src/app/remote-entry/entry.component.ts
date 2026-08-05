import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'mfe-auth-entry',
  standalone: true,
  imports: [LoginComponent],
  template: `<mfe-auth-login></mfe-auth-login>`
})
export class RemoteEntryComponent {}
