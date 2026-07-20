import React from 'react';
import { Layout } from '../components/site';

export const Index = () => {
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <h4 className="text-3xl font-bold mb-6 gold-text uppercase">Latest Moments</h4>
          <div className="space-y-8">
            <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
              <p className="text-zinc-500">Moment Image Placeholder</p>
            </div>
            <p className="text-zinc-400 italic">"Every post is a Moment. Everything else becomes part of the story."</p>
          </div>
        </div>
        <aside className="bg-zinc-950 p-6 rounded-lg border border-zinc-900">
          <h4 className="font-bold mb-4 uppercase tracking-widest text-xs gold-text">Search</h4>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Exploring..." 
              className="w-full bg-black border border-zinc-800 p-2 rounded text-sm focus:outline-none focus:border-gold"
            />
          </div>
        </aside>
      </div>
    </Layout>
  );
};