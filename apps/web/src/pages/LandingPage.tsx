import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Infinity, XCircle, Check } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900">
        {/* Optional subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-shadow-lg">
            Nikmati Hiburan Tanpa Batas Bersama Alkamus
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Ribuan film dan series berkualitas dalam satu platform. Bebas batalkan kapan saja.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 text-lg"
            >
              Mulai Uji Coba Gratis
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-black font-bold py-4 px-8 rounded-lg transition-all duration-300 text-lg">
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <main>
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Mengapa Memilih Alkamus?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300">
              <Monitor size={48} className="text-red-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Tonton Dimana Saja</h3>
              <p className="text-gray-300">
                Streaming di smartphone, tablet, laptop, dan TV tanpa batas
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300">
              <Infinity size={48} className="text-red-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Hiburan Tanpa Batas</h3>
              <p className="text-gray-300">
                Nikmati ribuan film dan series kapan pun kamu mau
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300">
              <XCircle size={48} className="text-red-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Batalkan Kapan Saja</h3>
              <p className="text-gray-300">
                Tanpa komitmen. Batalkan langganan online kapan saja
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-4 max-w-7xl mx-auto bg-gray-900">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Pilih Paket Yang Tepat Untuk Anda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:scale-105 transition-all duration-300 relative">
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-red-600">Rp 49.000</span>
                <span className="text-lg text-gray-400">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Kualitas HD</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>1 Layar bersamaan</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Smartphone & Tablet</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Download: 5 judul</span>
                </li>
              </ul>
              <button className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300">
                Pilih Paket
              </button>
            </div>

            {/* Standard Plan - Most Popular */}
            <div className="bg-gray-800 p-8 rounded-xl border-2 border-red-600 hover:scale-105 transition-all duration-300 relative shadow-lg shadow-red-500/20">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-red-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                  PALING POPULER
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Standard</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-red-600">Rp 79.000</span>
                <span className="text-lg text-gray-400">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Kualitas Full HD</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>2 Layar bersamaan</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Semua Device</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Download: 15 judul</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Akses awal konten baru</span>
                </li>
              </ul>
              <button className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-all duration-300">
                Pilih Paket
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:scale-105 transition-all duration-300 relative">
              <h3 className="text-2xl font-bold mb-4">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-red-600">Rp 99.000</span>
                <span className="text-lg text-gray-400">/bulan</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Kualitas 4K Ultra HD</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>4 Layar bersamaan</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Semua Device</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Download: 30 judul</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Konten eksklusif</span>
                </li>
                <li className="flex items-center">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>Watch Party</span>
                </li>
              </ul>
              <button className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300">
                Pilih Paket
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-red-600 to-red-800">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              Siap Menonton? Mulai Uji Coba Gratis Hari Ini
            </h2>
            <Link
              to="/register"
              className="bg-white text-black font-bold py-5 px-12 rounded-lg hover:scale-105 transition-all duration-300 text-xl inline-block"
            >
              Mulai Sekarang
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

