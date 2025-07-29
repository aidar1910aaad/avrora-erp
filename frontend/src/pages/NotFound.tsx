import React from 'react';

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-8">
    <h1 className="text-7xl font-extrabold text-gray-300 mb-4">404</h1>
    <h2 className="text-2xl font-bold text-gray-700 mb-2">Страница не найдена</h2>
    <p className="text-gray-500 mb-6">Возможно, вы ошиблись адресом или страница была удалена.</p>
    <a
      href="/"
      className="inline-block px-8 py-3 text-lg font-extrabold bg-yellow-400 text-black rounded shadow border border-yellow-500 hover:bg-yellow-300 hover:text-black transition"
    >
      На главную
    </a>
  </div>
);

export default NotFound; 