"use client";

import { ShoppingCart, Menu, Search, Heart, Star, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [cartCount, setCartCount] = useState(0);

  const categories = [
    { name: '강아지 용품', icon: '🐕', color: 'bg-blue-50' },
    { name: '고양이 용품', icon: '🐈', color: 'bg-pink-50' },
    { name: '사료/간식', icon: '🍖', color: 'bg-orange-50' },
    { name: '장난감', icon: '🎾', color: 'bg-green-50' },
  ];

  const products = [
    {
      id: 1,
      name: '프리미엄 강아지 사료',
      price: 45000,
      rating: 4.8,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
      badge: '인기'
    },
    {
      id: 2,
      name: '코듀로이 강아지 하네스',
      price: 28000,
      rating: 4.9,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1760596687389-93d4fcf1c776?w=400',
      badge: 'NEW'
    },
    {
      id: 3,
      name: '고양이 스크래쳐 타워',
      price: 52000,
      rating: 4.7,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400',
      badge: '베스트'
    },
    {
      id: 4,
      name: '강아지 장난감 세트',
      price: 18000,
      rating: 4.6,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400',
      badge: '할인'
    },
    {
      id: 5,
      name: '코기 전용 침대',
      price: 65000,
      rating: 4.9,
      reviews: 98,
      image: 'https://images.unsplash.com/photo-1760596687491-7b99fb80bb43?w=400',
      badge: '신상품'
    },
    {
      id: 6,
      name: '고양이 터널 장난감',
      price: 22000,
      rating: 4.8,
      reviews: 145,
      image: 'https://images.unsplash.com/photo-1742565850085-bf02c1e7cba4?w=400',
      badge: '인기'
    },
  ];

  const addToCart = () => {
    setCartCount(cartCount + 1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-indigo-600">🐾 PetMart</h1>
              <nav className="hidden md:flex gap-6">
                <a href="#" className="text-gray-700 hover:text-indigo-600 transition">전체상품</a>
                <a href="#" className="text-gray-700 hover:text-indigo-600 transition">강아지</a>
                <a href="#" className="text-gray-700 hover:text-indigo-600 transition">고양이</a>
                <a href="#" className="text-gray-700 hover:text-indigo-600 transition">특가세일</a>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button className="md:hidden p-2">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                우리 아이를 위한<br />특별한 선물
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                건강하고 행복한 반려생활을 위한 프리미엄 용품
              </p>
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
                쇼핑 시작하기
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="relative h-96 hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1760596687389-93d4fcf1c776?w=600"
                alt="Happy puppy"
                className="w-full h-full object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">카테고리</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                className={`${category.color} p-6 rounded-xl hover:shadow-md transition`}
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <div className="font-semibold text-gray-800">{category.name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">인기 상품</h3>
            <button className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              전체보기
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                    {product.badge}
                  </span>
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                    <span className="text-sm text-gray-400">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      {product.price.toLocaleString()}원
                    </span>
                    <button
                      onClick={addToCart}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      담기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">무료배송</h4>
              <p className="text-gray-600">5만원 이상 구매시 무료배송</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💝</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">첫 구매 혜택</h4>
              <p className="text-gray-600">신규 회원 15% 할인 쿠폰</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">적립금</h4>
              <p className="text-gray-600">구매금액의 5% 적립</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="text-white font-bold mb-4">🐾 PetMart</h5>
              <p className="text-sm">반려동물과 함께하는 행복한 일상</p>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">고객센터</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">공지사항</a></li>
                <li><a href="#" className="hover:text-white transition">자주 묻는 질문</a></li>
                <li><a href="#" className="hover:text-white transition">1:1 문의</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">쇼핑정보</h6>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">배송안내</a></li>
                <li><a href="#" className="hover:text-white transition">교환/반품</a></li>
                <li><a href="#" className="hover:text-white transition">이용약관</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4">회사정보</h6>
              <ul className="space-y-2 text-sm">
                <li>대표: 홍길동</li>
                <li>사업자번호: 123-45-67890</li>
                <li>고객센터: 1588-0000</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            © 2026 PetMart. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}