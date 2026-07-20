import React from 'react';
import { siteData } from './site-data';
import { MapPin, Sun } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="ogeneo-header p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tighter gold-text">
            {siteData.title}
          </h1>
          <nav className="flex space-x-8">
            {siteData.navLinks.map(link => (
              <a key={link.label} href={link.href} className="font-medium nav-link uppercase text-sm tracking-widest">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full p-8">
        <section className="mb-12 text-center py-16">
          <h2 className="text-6xl font-black mb-4 uppercase">{siteData.title}</h2>
          <p className="text-xl gold-text italic">{siteData.tagline}</p>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg mb-12">
          <div className="flex items-center space-x-4 mb-4">
            <MapPin className="gold-text" size={24} />
            <h3 className="text-2xl font-bold uppercase tracking-tight">Currently Wandering</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <div>
              <p className="text-zinc-400 uppercase text-xs tracking-widest mb-1">Location</p>
              <p>🇫🇷 {siteData.currentLocation.village}, {siteData.currentLocation.country}</p>
            </div>
            <div>
              <p className="text-zinc-400 uppercase text-xs tracking-widest mb-1">Activity</p>
              <p>{siteData.currentLocation.activity}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="text-yellow-500" size={20} />
              <p>{siteData.currentLocation.temp} • {siteData.currentLocation.time}</p>
            </div>
          </div>
        </section>

        {children}
      </main>

      <footer className="p-8 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        <p>&copy; 2026 OgeneO. All rights reserved.</p>
      </footer>
    </div>
  );
};