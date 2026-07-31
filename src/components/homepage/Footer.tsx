'use client'

import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

const quickLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Academics', href: '/academics' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
]

const contactInfo = [
  { icon: MapPin, text: '123 Education Avenue, Lagos, Nigeria' },
  { icon: Phone, text: '+234 800 VINCOLLINS' },
  { icon: Mail, text: 'info@vincollins.edu.ng' },
]

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-display text-2xl mb-4">Vincollins</h3>
            <p className="text-white/70 text-sm mb-4">
              Geared Towards Excellence
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              {contactInfo.map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-white/70">
                  <item.icon className="w-5 h-5 text-accent-light shrink-0 mt-0.5" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Stay Connected</h4>
            <p className="text-white/70 text-sm mb-4">
              Subscribe to our newsletter for updates and news.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-lg bg-white/10 text-white placeholder:text-white/50 border-0 focus:ring-2 focus:ring-accent"
              />
              <button className="px-4 py-2 bg-accent text-primary rounded-r-lg font-semibold hover:bg-accent-light transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/60">
          <p>
            © {new Date().getFullYear()} Vincollins Schools. All rights reserved. 
            Geared Towards Excellence.
          </p>
        </div>
      </div>
    </footer>
  )
}