import React, { useState, useEffect } from 'react';
import { FaHome, FaUser, FaCog, FaAngleDoubleLeft, FaAngleDoubleRight, FaChevronDown } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    icon: <FaHome />, label: 'Главная', href: '#',
    submenu: [
      { label: 'Клиенты', href: '/customers' },
      { label: 'Продукты', href: '/products' },
    ]
  },
  { icon: <FaUser />, label: 'Профиль', href: '/profile' },
  { icon: <FaCog />, label: 'Настройки', href: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const location = useLocation();


  useEffect(() => {
    if (isOpen) onClose();
  }, [location.pathname]);

  useEffect(() => {
    if (collapsed) setOpenSubmenu(null);
  }, [collapsed]);

  const handleSubmenuToggle = (idx: number) => {
    if (collapsed) return;
    setOpenSubmenu(openSubmenu === idx ? null : idx);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose}
      />
      <div
        className={`
          bg-white/90 backdrop-blur-sm text-gray-900 flex flex-col transition-all duration-300 shadow-xl border-r border-gray-200/50 min-h-0 z-40 h-full
          ${collapsed ? 'w-20' : 'w-64'}
          ${collapsed ? 'items-center' : ''}
          fixed top-0 left-0 md:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${isOpen ? 'block' : 'hidden'} md:block
        `}
        style={{
          transitionProperty: 'width, transform',
          transitionDuration: '300ms',
          height: '100%',
        }}
      >
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 focus:outline-none md:hidden ml-auto mt-4 mb-2 mr-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <nav className="flex-1 pt-0 p-4 space-y-2 w-full">
          {navItems.map((item, idx) => (
            <div key={idx} className="w-full">
              {item.submenu ? (
                <button
                  type="button"
                  className={`flex items-center w-full px-4 py-2 rounded hover:bg-gray-100 transition-colors ${collapsed ? 'justify-center' : ''}`}
                  onClick={() => handleSubmenuToggle(idx)}
                  tabIndex={0}
                  disabled={collapsed}
                >
                  <span className="text-xl text-gray-500">{item.icon}</span>
                  {!collapsed && <span className="ml-3 flex-1 text-left">{item.label}</span>}
                  {!collapsed && (
                    <FaChevronDown className={`ml-2 transition-transform duration-300 ${openSubmenu === idx ? 'rotate-180' : ''}`} />
                  )}
                </button>
              ) : (
                <a
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded hover:bg-gray-100 transition-colors ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="text-xl text-gray-500">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </a>
              )}
          
              {item.submenu && (
                <div
                  className={`overflow-hidden transition-all duration-300 bg-gray-50 rounded ${openSubmenu === idx && !collapsed ? 'max-h-40 py-1' : 'max-h-0 py-0'}`}
                  style={{
                    transitionProperty: 'max-height, padding',
                  }}
                >
                  {item.submenu.map((sub, subIdx) => (
                    <a
                      key={subIdx}
                      href={sub.href}
                      className="block px-8 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 w-full p-4 flex justify-center bg-white/80 backdrop-blur-sm border-t border-gray-100/50">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center justify-center w-full p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm"
          >
            {collapsed ? <FaAngleDoubleRight className="text-gray-500" /> : <FaAngleDoubleLeft className="text-gray-500" />}
            {!collapsed && <span className="ml-2 text-sm">Свернуть</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;