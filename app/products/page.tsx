'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { defaultProducts } from '@/lib/default-products'

interface Product {
  _id?: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  stock: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [loading, setLoading] = useState(true)
  const [filteredCategory, setFilteredCategory] = useState('all')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [wishlistIds, setWishlistIds] = useState<string[]>([])

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    setIsLoggedIn(!!userId)
    setUserName(localStorage.getItem('userName') || '')

    const fetchPageData = async () => {
      try {
        const requests = [fetch('/api/products')]
        if (userId) {
          requests.push(fetch(`/api/wishlist/${userId}`))
        }

        const responses = await Promise.all(requests)
        const productRes = responses[0]
        const productData = await productRes.json()
        setProducts(Array.isArray(productData) && productData.length > 0 ? productData : defaultProducts)

        if (userId && responses[1]) {
          const wishlistData = await responses[1].json()
          if (wishlistData?.items) {
            setWishlistIds(
              wishlistData.items
                .map((item: { productId?: { _id?: string } }) => item.productId?._id)
                .filter(Boolean)
            )
          }
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setProducts(defaultProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchPageData()
  }, [])

  const handleAddToCart = async (productId?: string) => {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      alert('먼저 로그인해주세요.')
      window.location.href = '/auth?type=login'
      return
    }

    if (!productId) {
      alert('상품 정보를 찾지 못했습니다.')
      return
    }

    try {
      const res = await fetch(`/api/cart/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('장바구니에 담았습니다.')
      } else {
        alert(data.message || '장바구니 담기에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('장바구니 저장 중 오류가 발생했습니다.')
    }
  }

  const handleToggleWishlist = async (productId?: string) => {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      alert('먼저 로그인해주세요.')
      window.location.href = '/auth?type=login'
      return
    }

    if (!productId) {
      alert('상품 정보를 찾지 못했습니다.')
      return
    }

    const isLiked = wishlistIds.includes(productId)

    try {
      const res = await fetch(`/api/wishlist/${userId}`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || '찜 처리에 실패했습니다.')
        return
      }

      setWishlistIds(
        data.wishlist.items
          .map((item: { productId?: { _id?: string } }) => item.productId?._id)
          .filter(Boolean)
      )
    } catch (error) {
      console.error('Failed to update wishlist:', error)
      alert('찜 처리 중 오류가 발생했습니다.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    setIsLoggedIn(false)
    setUserName('')
    setWishlistIds([])
    window.location.href = '/'
  }

  const filteredProducts = filteredCategory === 'all'
    ? products
    : products.filter((product) => product.category === filteredCategory)

  const categories = ['all', ...Array.from(new Set(products.map((product) => product.category)))]

  if (loading) {
    return <LoadingText>상품을 불러오는 중입니다...</LoadingText>
  }

  return (
    <Container>
      <Header>
        <Title>PetMart 상품 목록</Title>
        <NavLinks>
          <Link href="/">메인</Link>
          <Link href="/cart">장바구니</Link>
          <WishlistNavLink href="/mypage?tab=wishlist">
            찜한 상품
            {wishlistIds.length > 0 && <WishlistBadge>{wishlistIds.length}</WishlistBadge>}
          </WishlistNavLink>
          {isLoggedIn ? (
            <>
              <Link href="/mypage">{userName || '마이페이지'}</Link>
              <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </>
          ) : (
            <Link href="/auth?type=login">로그인</Link>
          )}
        </NavLinks>
      </Header>

      <FilterSection>
        <FilterLabel>카테고리</FilterLabel>
        {categories.map((category) => (
          <FilterButton
            key={category}
            $active={filteredCategory === category}
            onClick={() => setFilteredCategory(category)}
          >
            {category === 'all' ? '전체' : category}
          </FilterButton>
        ))}
      </FilterSection>

      <ProductGrid>
        {filteredProducts.map((product) => {
          const isLiked = !!product._id && wishlistIds.includes(product._id)

          return (
            <ProductCard key={product._id || product.name}>
              <ImageWrap>
                <ImageBox $image={product.image} />
                <WishlistButton type="button" onClick={() => handleToggleWishlist(product._id)}>
                  <Heart className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'} size={18} />
                </WishlistButton>
              </ImageWrap>
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductDescription>{product.description}</ProductDescription>
                <PriceBox>
                  <Price>{product.price.toLocaleString()}원</Price>
                  <Stock $available={product.stock > 0}>
                    {product.stock > 0 ? `재고 ${product.stock}` : '품절'}
                  </Stock>
                </PriceBox>
                <CartButton
                  onClick={() => handleAddToCart(product._id)}
                  disabled={!product._id || product.stock === 0}
                >
                  {product.stock > 0 ? '장바구니 담기' : '품절'}
                </CartButton>
              </ProductInfo>
            </ProductCard>
          )
        })}
      </ProductGrid>

      {filteredProducts.length === 0 && (
        <EmptyMessage>등록된 상품이 없습니다.</EmptyMessage>
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
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const Title = styled.h1`
  font-size: 2rem;
  color: #2d3748;
`

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  a, button {
    padding: 0.6rem 1rem;
    background: #4299e1;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.95rem;
  }

  a:hover, button:hover {
    background: #3182ce;
    transform: translateY(-2px);
  }
`

const LogoutButton = styled.button``

const WishlistNavLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`

const WishlistBadge = styled.span`
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #e11d48;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
`

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
`

const FilterLabel = styled.span`
  font-weight: bold;
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

const ImageWrap = styled.div`
  position: relative;
`

const ImageBox = styled.div<{ $image?: string }>`
  width: 100%;
  height: 220px;
  background: ${(props) =>
    props.$image ? `url(${props.$image}) center/cover no-repeat` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
`

const WishlistButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  font-size: 0.95rem;
  color: #718096;
  margin-bottom: 1rem;
  line-height: 1.5;
  min-height: 3rem;
`

const PriceBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
`

const Price = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  color: #2d3748;
`

const Stock = styled.span<{ $available: boolean }>`
  font-size: 0.9rem;
  color: ${(props) => (props.$available ? '#38a169' : '#e53e3e')};
  font-weight: bold;
`

const CartButton = styled.button`
  width: 100%;
  padding: 0.8rem;
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
