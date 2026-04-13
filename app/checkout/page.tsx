'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useSearchParams } from 'next/navigation'

interface Cart {
  items: { productId: { name: string }; quantity: number; price: number }[]
  totalPrice: number
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId') || ''

  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [shippingAddress, setShippingAddress] = useState('')
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!userId) {
      alert('사용자 정보를 찾을 수 없습니다')
      window.location.href = '/cart'
      return
    }

    fetchCart()
  }, [userId])

  const fetchCart = async () => {
    try {
      const res = await fetch(`/api/cart/${userId}`)
      const data = await res.json()
      setCart(data)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      setMessage('✗ 배송 주소를 입력하세요')
      return
    }

    setProcessing(true)
    setMessage('')

    try {
      // 결제 시뮬레이션 (실제로는 결제 게이트웨이 연동)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const res = await fetch(`/api/orders/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          shippingAddress,
        }),
      })

      if (res.ok) {
        setMessage('✓ 주문이 완료되었습니다!')
        setTimeout(() => {
          window.location.href = `/mypage?tab=orders`
        }, 1500)
      } else {
        setMessage('✗ 주문 처리 실패')
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      setMessage('✗ 결제 중 오류가 발생했습니다')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <LoadingText>로딩 중...</LoadingText>
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container>
        <EmptyMessage>장바구니가 비어있습니다</EmptyMessage>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>💳 결제</Title>
      </Header>

      <ContentWrapper>
        <OrderSummary>
          <SectionTitle>주문 상품</SectionTitle>

          {cart.items.map((item, idx) => (
            <ItemRow key={idx}>
              <ItemInfo>
                <ItemName>{item.productId.name}</ItemName>
                <Quantity>수량: {item.quantity}개</Quantity>
              </ItemInfo>
              <ItemPrice>₩{(item.price * item.quantity).toLocaleString()}</ItemPrice>
            </ItemRow>
          ))}

          <TotalRow>
            <TotalLabel>총액:</TotalLabel>
            <TotalAmount>₩{cart.totalPrice.toLocaleString()}</TotalAmount>
          </TotalRow>
        </OrderSummary>

        <CheckoutForm>
          <FormSection>
            <SectionTitle>배송 정보</SectionTitle>

            <FormGroup>
              <Label htmlFor="address">배송 주소 *</Label>
              <TextArea
                id="address"
                placeholder="상세 배송 주소를 입력하세요"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={4}
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>결제 방법</SectionTitle>

            <RadioGroup>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="payment"
                  value="credit-card"
                  checked={paymentMethod === 'credit-card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                💳 신용카드
              </RadioLabel>

              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="payment"
                  value="debit-card"
                  checked={paymentMethod === 'debit-card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                💳 직불카드
              </RadioLabel>

              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="payment"
                  value="bank-transfer"
                  checked={paymentMethod === 'bank-transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                🏦 계좌이체
              </RadioLabel>

              <RadioLabel>
                <RadioInput
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                💰 PayPal
              </RadioLabel>
            </RadioGroup>
          </FormSection>

          {message && (
            <MessageBox $isSuccess={message.includes('✓')}>
              {message}
            </MessageBox>
          )}

          <SubmitButton onClick={handleCheckout} disabled={processing}>
            {processing ? '결제 처리 중...' : `${cart.totalPrice.toLocaleString()}원 결제하기`}
          </SubmitButton>

          <CancelButton href="/cart">← 장바구니로 돌아가기</CancelButton>
        </CheckoutForm>
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
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
`

const Title = styled.h1`
  font-size: 2rem;
  color: #2d3748;
`

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const OrderSummary = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
`

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 1rem;
`

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
`

const ItemInfo = styled.div`
  flex: 1;
`

const ItemName = styled.div`
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
`

const Quantity = styled.div`
  font-size: 0.9rem;
  color: #718096;
`

const ItemPrice = styled.div`
  font-weight: bold;
  color: #2d3748;
  text-align: right;
`

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-top: 2px solid #e0e0e0;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1rem;
`

const TotalLabel = styled.span`
  color: #2d3748;
`

const TotalAmount = styled.span`
  color: #48bb78;
`

const CheckoutForm = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const FormSection = styled.div`
  margin-bottom: 2rem;
`

const FormGroup = styled.div`
  margin-bottom: 1rem;
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3748;
  font-weight: 500;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }
`

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #2d3748;
  font-weight: 500;
`

const RadioInput = styled.input`
  margin-right: 0.75rem;
  cursor: pointer;
  width: 18px;
  height: 18px;
`

const MessageBox = styled.div<{ $isSuccess: boolean }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: bold;
  background: ${(props) => (props.$isSuccess ? '#c6f6d5' : '#fed7d7')};
  color: ${(props) => (props.$isSuccess ? '#22543d' : '#742a2a')};
  border: 1px solid ${(props) => (props.$isSuccess ? '#9ae6b4' : '#fc8181')};
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 0.5rem;

  &:hover:not(:disabled) {
    background: #38a169;
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`

const CancelButton = styled.a`
  display: block;
  width: 100%;
  text-align: center;
  padding: 0.75rem;
  background: #e0e0e0;
  color: #2d3748;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s;

  &:hover {
    background: #cbd5e0;
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