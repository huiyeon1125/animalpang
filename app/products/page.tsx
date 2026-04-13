'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  stock: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredCategory, setFilteredCategory] = useState('all')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    setIsLoggedIn(!!userId)

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = async (productId: string) => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('먼저 로그인하세요')
      window.location.href = '/auth'
      return
    }

    try {
      const res = await fetch(`/api/cart/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (res.ok) {
        alert('✓ 상품이 장바구니에 추가되었습니다')
      } else {
        alert('✗ 장바구니 추가 실패')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userId')
    setIsLoggedIn(false)
    window.location.href = '/'
  }

  const filteredProducts = filteredCategory === 'all'
    ? products
    : products.filter(p => p.category === filteredCategory)

  const categories = ['all', ...new Set(products.map(p => p.category))]

  if (loading) {
    return <LoadingText>상품을 불러오는 중...</LoadingText>
  }

  return (
    <Container>
      <Header>
        <Title>🐾 반려동물 쇼핑</Title>
        <NavLinks>
          {isLoggedIn ? (
            <>
              <Link href="/mypage">마이페이지</Link>
              <Link href="/cart">장바구니</Link>
              <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </>
          ) : (
            <>
              <Link href="/auth">로그인</Link>
              <Link href="/cart">장바구니</Link>
              <Link href="/admin">관리자</Link>
            </>
          )}
        </NavLinks>
      </Header>

      <FilterSection>
        <FilterLabel>카테고리:</FilterLabel>
        {categories.map((cat) => (
          <FilterButton
            key={cat}
            $active={filteredCategory === cat}
            onClick={() => setFilteredCategory(cat)}
          >
            {cat === 'all' ? '전체' : cat}
          </FilterButton>
        ))}
      </FilterSection>

      <ProductGrid>
        {filteredProducts.map((product) => (
          <ProductCard key={product._id}>
            <ImageBox $image={product.image}></ImageBox>
            <ProductInfo>
              <ProductName>{product.name}</ProductName>
              <ProductDescription>{product.description}</ProductDescription>
              <PriceBox>
                <Price>₩{product.price.toLocaleString()}</Price>
                <Stock $available={product.stock > 0}>
                  {product.stock > 0 ? `재고: ${product.stock}` : '품절'}
                </Stock>
              </PriceBox>
              <CartButton
                onClick={() => handleAddToCart(product._id)}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? '🛒 장바구니 추가' : '품절됨'}
              </CartButton>
            </ProductInfo>
          </ProductCard>
        ))}
      </ProductGrid>

      {filteredProducts.length === 0 && (
        <EmptyMessage>상품이 없습니다</EmptyMessage>
      )}
    </Container>
  )
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
  padding: 2rem;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
`

const Title = styled.h1`
  font-size: 2rem;
  color: #2d3748;
`

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;

  a, button {
    padding: 0.5rem 1rem;
    background: #4299e1;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: #3182ce;
      transform: translateY(-2px);
    }
  }
`

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`

const FilterLabel = styled.span`
  font-weight: bold;
  align-self: center;
  color: #2d3748;
`

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  border: 2px solid ${(props) => (props.$active ? '#4299e1' : '#cbd5e0')};
  background: ${(props) => (props.$active ? '#4299e1' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#2d3748')};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #4299e1;
    background: ${(props) => (props.$active ? '#3182ce' : '#ebf8ff')};
  }
`

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
`

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`

const ImageBox = styled.div<{ $image?: string }>`
  width: 100%;
  height: 200px;
  background: ${(props) =>
    props.$image ? `url(${props.$image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
`

const ProductInfo = styled.div`
  padding: 1.5rem;
`

const ProductName = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
`

const ProductDescription = styled.p`
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 1rem;
  line-height: 1.4;
`

const PriceBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const Price = styled.span`
  font-size: 1.3rem;
  font-weight: bold;
  color: #2d3748;
`

const Stock = styled.span<{ $available: boolean }>`
  font-size: 0.9rem;
  color: ${(props) => (props.$available ? '#48bb78' : '#f56565')};
  font-weight: bold;
`

const CartButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: #38a169;
    transform: scale(1.02);
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`

const LoadingText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #718096;
`

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.1rem;
`