"use client";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/app/data/navLinks";
import Link from "next/link";
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav
        className={`z-50 ${
          isHome
            ? "fixed top-10 left-0 right-0 bg-[rgb(234,233,228)] md:bg-[rgb(234,233,228)] py-1"
            : "absolute top-7 left-0 right-0 bg-transparent"
        }`}
      >
        <div className="pl-4 lg:pl-8 pr-2 lg:pr-3">
          {/* ================= MOBILE (HOME PAGE ONLY) ================= */}
          {isHome && (
            <div className="md:hidden">
              <div className="flex flex-col items-center ml-3">
                <Link href="/">
                  <span className="font-abyssinica text-3xl text-gray-700 font-bold block ml-1 mb-0">
                    HAIR
                  </span>
                  <span className="font-akronim text-4xl text-gray-700 font-bold block -ml-2">
                    Universe
                  </span>
                </Link>
              </div>

              <div className="border-t border-gray-500 w-full my-2" />

              <div className="flex items-center justify-between">
                {/* Cart Icon - ONLY ON HOME PAGE */}
                <Link href="/cart" className="relative">
                  <ShoppingCartIcon className="w-8 h-10 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="flex-1 flex justify-center">
                  {isMenuOpen ? (
                    <XMarkIcon
                      className="w-8 h-7 bg-gray-700 m-2 text-gray-100 cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    />
                  ) : (
                    <Bars3Icon
                      className="w-8 h-7 bg-gray-700 m-1 text-gray-100 cursor-pointer"
                      onClick={() => setIsMenuOpen(true)}
                    />
                  )}
                </div>

                <div className="w-6 h-6" />
              </div>
            </div>
          )}

          {/* ================= DESKTOP (HOME PAGE ONLY) ================= */}
          {isHome && (
            <div className="hidden md:block">
              <div className="flex justify-between items-start">
                <Link href="/">
                  <div className="flex flex-col">
                    <span className="font-abyssinica text-3xl text-gray-700 font-bold">
                      HAIR
                    </span>
                    <span className="font-akronim text-4xl text-gray-700 font-bold">
                      Universe
                    </span>
                  </div>
                </Link>

                <div>
                  <div className="font-alkalami flex items-center space-x-1 pt-2 justify-end">
                    {/* Cart Icon - ONLY ON HOME PAGE */}
                    <Link href="/cart" className="relative">
                      <ShoppingBagIcon className="w-10 h-8.5 text-gray-700" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <div className="flex space-x-2 text-gray-700">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="font-alkalami text-2xl uppercase px-2 py-1 hover:bg-black hover:text-white transition"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= NON-HOME PAGES (MOBILE) ================= */}
          {!isHome && (
            <div className="md:hidden flex justify-end items-center space-x-4">
              {/* NO CART ICON HERE - Only menu button */}
              {isMenuOpen ? (
                <XMarkIcon
                  className="w-10 h-8 text-white cursor-pointer"
                  style={{ backgroundColor: "rgb(255, 66, 179)" }}
                  onClick={() => setIsMenuOpen(false)}
                />
              ) : (
                <Bars3Icon
                  className="w-10 h-8 text-white cursor-pointer"
                  style={{ backgroundColor: "rgb(255, 66, 179)" }}
                  onClick={() => setIsMenuOpen(true)}
                />
              )}
            </div>
          )}

          {/* ================= DESKTOP (NON-HOME PAGES) ================= */}
          {!isHome && (
            <div className="hidden md:block">
              <div className="flex justify-end items-center pt-4 pr-2">
                <div className="flex items-center space-x-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="font-alkalami text-base uppercase text-gray-500 hover:text-pink-300 transition duration-200"
                    >
                      {link.name}
                    </Link>
                  ))}
                  {/* NO CART ICON HERE */}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ================= MOBILE MENU FOR HOME PAGE ================= */}
      {isMenuOpen && isHome && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="md:hidden">
            <div className="fixed top-10 right-0 h-1/2.5 w-2/7 bg-gray-500 text-stone-100 z-60 shadow-md rounded-bl-md">
              <div className="space-y-4 py-5 pl-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm uppercase hover:bg-gray-700 hover:text-white px-2 py-1 rounded"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= MOBILE MENU FOR NON-HOME PAGES ================= */}
      {isMenuOpen && !isHome && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="md:hidden fixed top-[70px] left-0 right-0 w-full bg-white z-50 shadow-lg">
            <div className="p-5">
              <div className="space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-base uppercase text-gray-800 hover:text-pink-600 px-3 py-3 border-b border-gray-200 last:border-b-0 transition"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
