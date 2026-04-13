'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'

interface CartItem {
  productId: { _id: string; name: string; price: number }
  quantity: number
  price: number
}

interface Cart {
  _id: string
  items: CartItem[]
  totalPrice: number
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('userId')
    if (!id) {
      alert('로그인이 필요합니다')
      window.location.href = '/auth'
      return
    }

    setUserId(id)
    fetchCart(id)
  }, [])

  const fetchCart = async (id: string) => {
    try {
      const res = await fetch(`/api/cart/${id}`)
      const data = await res.json()
      setCart(data)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!userId) return

    try {
      const res = await fetch(`/api/cart/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      })

      if (res.ok) {
        const updatedCart = await res.json()
        setCart(updatedCart.cart)
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    await handleUpdateQuantity(productId, 0)
  }

  const handleClearCart = async () => {
    if (!userId) return

    if (confirm('장바구니를 비우시겠습니까?')) {
      try {
        const res = await fetch(`/api/cart/${userId}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          setCart(null)
          alert('✓ 장바구니가 비워졌습니다')
        }
      } catch (error) {
        console.error('Failed to clear cart:', error)
      }
    }
  }

  if (loading) {
    return <LoadingText>장바구니를 불러오는 중...</LoadingText>
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container>
        <Header>
          <Title>🛒 장바구니</Title>
          <BackLink href="/products">← 쇼핑 계속하기</BackLink>
        </Header>
        <EmptyMessage>
          장바구니가 비어있습니다
          <BackLink href="/products">상품 보러가기</BackLink>
        </EmptyMessage>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>🛒 장바구니</Title>
        <BackLink href="/products">← 쇼핑 계속하기</BackLink>
      </Header>

      <ContentWrapper>
        <CartItemsSection>
          <SectionTitle>상품 목록 ({cart.items.length}개)</SectionTitle>

          {cart.items.map((item) => (
            <CartItemCard key={item.productId._id}>
              <ProductName>{item.productId.name}</ProductName>
              <ItemDetails>
                <PriceInfo>
                  <Label>가격:</Label>
                  <Price>₩{item.price.toLocaleString()}</Price>
                </PriceInfo>

                <QuantityControl>
                  <Label>수량:</Label>
                  <QuantityInput
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateQuantity(item.productId._id, parseInt(e.target.value))
                    }
                  />
                </QuantityControl>

                <SubtotalInfo>
                  <Label>소계:</Label>
                  <Subtotal>₩{(item.price * item.quantity).toLocaleString()}</Subtotal>
                </SubtotalInfo>

                <RemoveButton onClick={() => handleRemoveItem(item.productId._id)}>
                  ✕ 제거
                </RemoveButton>
              </ItemDetails>
            </CartItemCard>
          ))}
        </CartItemsSection>

        <SummarySection>
          <SummaryTitle>주문 요약</SummaryTitle>

          <SummaryRow>
            <Label>상품 금액:</Label>
            <Amount>₩{cart.totalPrice.toLocaleString()}</Amount>
          </SummaryRow>

          <SummaryRow>
            <Label>배송료:</Label>
            <Amount>무료</Amount>
          </SummaryRow>

          <TotalRow>
            <Label>총액:</Label>
            <Total>₩{cart.totalPrice.toLocaleString()}</Total>
          </TotalRow>

          <CheckoutButton href={`/checkout?userId=${userId}`}>
            💳 결제 진행
          </CheckoutButton>

          <ClearButton onClick={handleClearCart}>
            🗑️ 장바구니 비우기
          </ClearButton>
        </SummarySection>
      </ContentWrapper>
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

const BackLink = styled(Link)`
  padding: 0.5rem 1rem;
  background: #4299e1;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    background: #3182ce;
  }
`

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const CartItemsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
`

const CartItemCard = styled.div`
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: #f9f9f9;
`

const ProductName = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #2d3748;
`

const ItemDetails = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`

const PriceInfo = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const QuantityControl = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const QuantityInput = styled.input`
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 1rem;
`

const SubtotalInfo = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const Subtotal = styled.span`
  font-weight: bold;
  color: #2d3748;
`

const Label = styled.span`
  color: #718096;
  font-weight: 500;
`

const Price = styled.span`
  font-weight: bold;
  color: #2d3748;
`

const RemoveButton = styled.button`
  padding: 0.5rem 1rem;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #e53e3e;
  }
`

const SummarySection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
`

const SummaryTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 1rem;
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`

const Amount = styled.span`
  color: #2d3748;
`

const TotalRow = styled(SummaryRow)`
  border-top: 2px solid #e0e0e0;
  padding-top: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`

const Total = styled.span`
  color: #2d3748;
  font-size: 1.2rem;
`

const CheckoutButton = styled(Link)`
  display: block;
  width: 100%;
  padding: 1rem;
  background: #48bb78;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s;

  &:hover {
    background: #38a169;
  }
`

const ClearButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #ed8936;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;

  &:hover {
    background: #dd6b20;
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
  padding: 2rem;
  background: white;
  border-radius: 12px;
  color: #718096;
  font-size: 1rem;

  ${BackLink} {
    display: inline-block;
    margin-top: 1.5rem;
  }
`