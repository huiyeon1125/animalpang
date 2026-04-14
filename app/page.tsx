"use client";

import Link from "next/link";
import { ChevronRight, Heart, Menu, Search, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultProducts } from "@/lib/default-products";

interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
}

const categories = [
  { name: "강아지 용품", icon: "🐶", color: "bg-blue-50" },
  { name: "고양이 용품", icon: "🐱", color: "bg-pink-50" },
  { name: "사료/간식", icon: "🦴", color: "bg-orange-50" },
  { name: "장난감", icon: "🎾", color: "bg-green-50" },
];

export default function Home() {
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const syncClientState = async () => {
      const savedUserName = localStorage.getItem("userName") || "";
      const userId = localStorage.getItem("userId");
      setUserName(savedUserName);

      try {
        const productRes = await fetch("/api/products");
        const productData = await productRes.json();

        if (productRes.ok && Array.isArray(productData) && productData.length > 0) {
          setProducts(productData.slice(0, 6));
        } else {
          setProducts(defaultProducts);
        }
      } catch (error) {
        console.error("Failed to fetch home products:", error);
        setProducts(defaultProducts);
      }

      if (!userId) {
        setCartCount(0);
        setWishlistIds([]);
        return;
      }

      try {
        const [cartRes, wishlistRes] = await Promise.all([
          fetch(`/api/cart/${userId}`),
          fetch(`/api/wishlist/${userId}`),
        ]);

        const cartData = await cartRes.json();
        const wishlistData = await wishlistRes.json();

        if (cartRes.ok && cartData?.items) {
          const itemCount = cartData.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
          setCartCount(itemCount);
        }

        if (wishlistRes.ok && wishlistData?.items) {
          setWishlistIds(
            wishlistData.items
              .map((item: { productId?: { _id?: string } }) => item.productId?._id)
              .filter(Boolean)
          );
        }
      } catch (error) {
        console.error("Failed to fetch user state:", error);
      }
    };

    syncClientState();
  }, []);

  const handleAddToCart = async (productId?: string) => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("먼저 로그인해주세요.");
      window.location.href = "/auth?type=login";
      return;
    }

    if (!productId) {
      alert("상품 정보를 찾지 못했습니다.");
      return;
    }

    try {
      const res = await fetch(`/api/cart/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "장바구니 담기에 실패했습니다.");
        return;
      }

      const itemCount = data.cart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
      setCartCount(itemCount);
      alert("장바구니에 담았습니다.");
    } catch (error) {
      console.error(error);
      alert("장바구니 저장 중 오류가 발생했습니다.");
    }
  };

  const handleToggleWishlist = async (productId?: string) => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("먼저 로그인해주세요.");
      window.location.href = "/auth?type=login";
      return;
    }

    if (!productId) {
      alert("상품 정보를 찾지 못했습니다.");
      return;
    }

    const isLiked = wishlistIds.includes(productId);

    try {
      const res = await fetch(`/api/wishlist/${userId}`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "찜 처리에 실패했습니다.");
        return;
      }

      setWishlistIds(
        data.wishlist.items
          .map((item: { productId?: { _id?: string } }) => item.productId?._id)
          .filter(Boolean)
      );
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      alert("찜 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              PetMart
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link href="/products" className="text-gray-700 transition hover:text-indigo-600">
                전체상품
              </Link>
              <a href="#" className="text-gray-700 transition hover:text-indigo-600">
                강아지
              </a>
              <a href="#" className="text-gray-700 transition hover:text-indigo-600">
                고양이
              </a>
              <a href="#" className="text-gray-700 transition hover:text-indigo-600">
                이벤트
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 transition hover:bg-gray-100">
              <Search className="h-5 w-5 text-gray-600" />
            </button>
            <Link href="/mypage?tab=wishlist" className="relative rounded-full p-2 transition hover:bg-gray-100">
              <Heart className="h-5 w-5 text-gray-600" />
              {wishlistIds.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs text-white">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <Link href="/cart" className="relative rounded-full p-2 transition hover:bg-gray-100">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {userName ? (
              <Link href="/mypage" className="text-sm font-medium text-gray-700 transition hover:text-indigo-600">
                {userName}
              </Link>
            ) : (
              <Link href="/auth?type=login" className="text-sm font-medium text-gray-700 transition hover:text-indigo-600">
                로그인 / 회원가입
              </Link>
            )}
            <button className="p-2 md:hidden">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-indigo-50 to-sky-50 py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              우리 아이를 위한
              <br />
              특별한 쇼핑
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              반려동물과 함께하는 일상을 더 즐겁게 만드는 인기 상품을 만나보세요.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-white transition hover:bg-indigo-700"
            >
              쇼핑 시작하기
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="relative hidden h-96 md:block">
            <img
              src="https://images.unsplash.com/photo-1760596687389-93d4fcf1c776?w=600"
              alt="Happy puppy"
              className="h-full w-full rounded-2xl object-cover shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">카테고리</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <button key={category.name} className={`${category.color} rounded-xl p-6 transition hover:shadow-md`}>
                <div className="mb-2 text-4xl">{category.icon}</div>
                <div className="font-semibold text-gray-800">{category.name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">인기 상품</h2>
            <Link href="/products" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
              전체보기
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const isLiked = !!product._id && wishlistIds.includes(product._id);

              return (
                <div key={product._id || product.name} className="group overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-lg">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image || defaultProducts[0].image}
                      alt={product.name}
                      className="h-64 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-3 py-1 text-sm text-white">
                      {product.category}
                    </span>
                    <button
                      onClick={() => handleToggleWishlist(product._id)}
                      className="absolute right-3 top-3 rounded-full bg-white p-2 opacity-100 transition hover:scale-105"
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">{product.name}</h3>
                    <div className="mb-2 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">대표 상품</span>
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="block text-xl font-bold text-gray-900">
                          {product.price.toLocaleString()}원
                        </span>
                        <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                          {product.stock > 0 ? `재고 ${product.stock}` : "품절"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        disabled={!product._id || product.stock <= 0}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        담기
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
