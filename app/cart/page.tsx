'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'

interface CartItem {
  productId: {
    _id: string
    name: string
    price: number
    image?: string
    description?: string
  }
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
      alert('로그인이 필요합니다.')
      window.location.href = '/auth?type=login'
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
      alert('장바구니를 불러오지 못했습니다.')
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

      const data = await res.json()

      if (res.ok) {
        setCart(data.cart)
      } else {
        alert(data.message || '수량 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
      alert('수량 변경 중 오류가 발생했습니다.')
    }
  }

  const handleRemoveItem = async (productId: string) => {
    await handleUpdateQuantity(productId, 0)
  }

  const handleClearCart = async () => {
    if (!userId) return

    if (!confirm('장바구니를 비우시겠습니까?')) {
      return
    }

    try {
      const res = await fetch(`/api/cart/${userId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        setCart({ _id: '', items: [], totalPrice: 0 })
        alert('장바구니를 비웠습니다.')
      } else {
        alert(data.message || '장바구니 비우기에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to clear cart:', error)
      alert('장바구니 비우기 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return <LoadingText>장바구니를 불러오는 중입니다...</LoadingText>
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container>
        <Header>
          <Title>장바구니</Title>
          <BackLink href="/">상품 계속 보기</BackLink>
        </Header>
        <EmptyMessage>
          장바구니가 비어 있습니다.
          <BackLink href="/">상품 보러가기</BackLink>
        </EmptyMessage>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>장바구니</Title>
        <BackLink href="/">상품 계속 보기</BackLink>
      </Header>

      <ContentWrapper>
        <CartItemsSection>
          <SectionTitle>담긴 상품 {cart.items.length}개</SectionTitle>

          {cart.items.map((item) => (
            <CartItemCard key={item.productId._id}>
              <Thumbnail $image={item.productId.image} />
              <ItemBody>
                <ProductName>{item.productId.name}</ProductName>
                {item.productId.description && (
                  <Description>{item.productId.description}</Description>
                )}
                <ItemDetails>
                  <InfoBlock>
                    <Label>가격</Label>
                    <Price>{item.price.toLocaleString()}원</Price>
                  </InfoBlock>

                  <QuantityControl>
                    <Label>수량</Label>
                    <QuantityButton
                      type="button"
                      onClick={() => handleUpdateQuantity(item.productId._id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </QuantityButton>
                    <QuantityValue>{item.quantity}</QuantityValue>
                    <QuantityButton
                      type="button"
                      onClick={() => handleUpdateQuantity(item.productId._id, item.quantity + 1)}
                    >
                      +
                    </QuantityButton>
                  </QuantityControl>

                  <InfoBlock>
                    <Label>합계</Label>
                    <Subtotal>{(item.price * item.quantity).toLocaleString()}원</Subtotal>
                  </InfoBlock>

                  <RemoveButton onClick={() => handleRemoveItem(item.productId._id)}>
                    삭제
                  </RemoveButton>
                </ItemDetails>
              </ItemBody>
            </CartItemCard>
          ))}
        </CartItemsSection>

        <SummarySection>
          <SummaryTitle>주문 요약</SummaryTitle>

          <SummaryRow>
            <Label>상품 금액</Label>
            <Amount>{cart.totalPrice.toLocaleString()}원</Amount>
          </SummaryRow>

          <SummaryRow>
            <Label>배송비</Label>
            <Amount>무료</Amount>
          </SummaryRow>

          <TotalRow>
            <Label>총 결제 금액</Label>
            <Total>{cart.totalPrice.toLocaleString()}원</Total>
          </TotalRow>

          <CheckoutButton href={`/checkout?userId=${userId}`}>
            결제 진행하기
          </CheckoutButton>

          <ClearButton onClick={handleClearCart}>장바구니 비우기</ClearButton>
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

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1rem;
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
  grid-template-columns: 1fr 340px;
  gap: 2rem;

  @media (max-width: 900px) {
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
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1rem;
  background: #f8fafc;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Thumbnail = styled.div<{ $image?: string }>`
  width: 100%;
  min-height: 120px;
  border-radius: 10px;
  background: ${(props) =>
    props.$image ? `url(${props.$image}) center/cover no-repeat` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
`

const ItemBody = styled.div``

const ProductName = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.35rem;
  color: #1a202c;
`

const Description = styled.p`
  color: #718096;
  margin-bottom: 1rem;
  line-height: 1.5;
`

const ItemDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 110px;
`

const Label = styled.span`
  color: #718096;
  font-weight: 600;
  font-size: 0.9rem;
`

const Price = styled.span`
  font-weight: bold;
  color: #2d3748;
`

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #4299e1;
  color: white;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background: #3182ce;
  }
`

const QuantityValue = styled.span`
  min-width: 24px;
  text-align: center;
  font-weight: bold;
  color: #2d3748;
`

const Subtotal = styled.span`
  font-weight: bold;
  color: #2d3748;
`

const RemoveButton = styled.button`
  padding: 0.7rem 1rem;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;

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
  font-size: 1.15rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`

const Total = styled.span`
  color: #2d3748;
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
  margin-bottom: 0.75rem;

  &:hover {
    background: #38a169;
  }
`

const ClearButton = styled.button`
  width: 100%;
  padding: 0.85rem;
  background: #ed8936;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;

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
    display: inline-flex;
    margin-top: 1.5rem;
  }
`
