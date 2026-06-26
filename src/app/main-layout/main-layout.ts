import { Component } from '@angular/core';
import { Footer } from "./footer/footer";
import { RouterOutlet } from "@angular/router";
import { Header } from "./header/header";
import { Sidebar } from "./sidebar/sidebar";

@Component({
  selector: 'app-main-layout',
  imports: [Footer, RouterOutlet, Header, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
