import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  model = { userId: "ilovecoding@hostelworld", password: "Hire_me!" };
  loginForm: FormGroup;
  returnUrl: string;

  errorMessages = {
    requiredUser: undefined,
    requiredPassword: undefined,
    userPassNoMatch: undefined
  }

  constructor(private formBuilder: FormBuilder, public router: Router) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      userId: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.returnUrl = '/dashboard';
  }

  get f() { return this.loginForm.controls; }

  login() {

    this.errorMessages = {
      requiredUser: undefined,
      requiredPassword: undefined,
      userPassNoMatch: undefined
    }

    if (this.loginForm.invalid) {
      if (this.loginForm.controls.userId.invalid) {
        this.errorMessages.requiredUser = 'User id is required'
      }
      if (this.loginForm.controls.password.invalid) {
        this.errorMessages.requiredPassword = 'Password is required'
      }
    }
    else {
      if (this.f.userId.value == this.model.userId && this.f.password.value == this.model.password) {

        localStorage.setItem('isLoggedIn', "true");
        localStorage.setItem('token', this.loginForm.controls.userId.value);
        this.router.navigate(['/dashboard']);
      }
      else {
        this.errorMessages.userPassNoMatch = "Please check your userid and password";
      }
    }
  }
}
