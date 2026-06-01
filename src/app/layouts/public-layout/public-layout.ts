import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { PublicChatbot } from '../../components/public-chatbot/public-chatbot';

@Component({
  selector: 'app-public-layout',
  imports: [Navbar, Footer, RouterOutlet, PublicChatbot],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {}
