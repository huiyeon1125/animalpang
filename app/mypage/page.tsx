'use client'

import { useEffect, useState, Suspense } from 'react'
import styled from 'styled-components'
import { useSearchParams } from 'next/navigation'

interface UserInfo {
  phone: string
  address: string
  city: string
  zipCode: string
  bio: string
}

interface Order {
  _id: string
  items: any[]
  totalPrice: number
  status: string
  createdAt: string
  shippingAddress: string
}

export default function MyPage() {
  return (
    <Suspense fallback={<LoadingText>로딩 중...</LoadingText>}>
      <MyPageContent />
    </Suspense>
  )
}

function MyPageContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'profile'

  const [userId, setUserId] = useState('')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<UserInfo>({
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    bio: '',
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('userId')
    if (!id) {
      alert('로그인이 필요합니다')
      window.location.href = '/auth'
      return
    }

    setUserId(id)
    fetchData(id)
  }, [])

  const fetchData = async (id: string) => {
    try {
      const [userRes, ordersRes] = await Promise.all([
        fetch(`/api/userinfo/${id}`),
        fetch(`/api/orders/${id}`),
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUserInfo(userData)
        setFormData(userData)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!userId) return

    try {
      const res = await fetch(`/api/userinfo/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setMessage('✓ 프로필이 저장되었습니다')
        setEditing(false)
        setUserInfo(formData)
      } else {
        setMessage('✗ 저장 실패')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      setMessage('✗ 저장 중 오류 발생')
    }
  }

  if (loading) {
    return <LoadingText>로딩 중...</LoadingText>
  }

  return (
    <Container>
      <Header>
        <Title>👤 마이페이지</Title>
        <LogoutButton onClick={() => {
          localStorage.removeItem('userId')
          window.location.href = '/auth'
        }}>
          로그아웃
        </LogoutButton>
      </Header>

      <TabBar>
        <TabButton 
          $active={tab === 'profile'} 
          href="?tab=profile"
        >
          프로필
        </TabButton>
        <TabButton 
          $active={tab === 'orders'} 
          href="?tab=orders"
        >
          주문 내역
        </TabButton>
      </TabBar>

      {tab === 'profile' && (
        <ProfileSection>
          <SectionTitle>개인 정보</SectionTitle>

          {editing ? (
            <EditForm>
              <FormGroup>
                <Label>전화번호</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="010-1234-5678"
                />
              </FormGroup>

              <FormGroup>
                <Label>도시</Label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="서울"
                />
              </FormGroup>

              <FormGroup>
                <Label>주소</Label>
                <TextArea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="상세 주소"
                  rows={3}
                />
              </FormGroup>

              <FormGroup>
                <Label>우편번호</Label>
                <Input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="12345"
                />
              </FormGroup>

              <FormGroup>
                <Label>소개</Label>
                <TextArea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="자기소개"
                  rows={3}
                />
              </FormGroup>

              {message && (
                <MessageBox $isSuccess={message.includes('✓')}>
                  {message}
                </MessageBox>
              )}

              <ButtonGroup>
                <SaveButton onClick={handleSaveProfile}>💾 저장</SaveButton>
                <CancelButton onClick={() => {
                  setEditing(false)
                  setFormData(userInfo || {
                    phone: '',
                    address: '',
                    city: '',
                    zipCode: '',
                    bio: '',
                  })
                }}>
                  취소
                </CancelButton>
              </ButtonGroup>
            </EditForm>
          ) : (
            <ProfileInfo>
              <InfoRow>
                <Label>전화번호:</Label>
                <Value>{userInfo?.phone || '설정되지 않음'}</Value>
              </InfoRow>

              <InfoRow>
                <Label>도시:</Label>
                <Value>{userInfo?.city || '설정되지 않음'}</Value>
              </InfoRow>

              <InfoRow>
                <Label>주소:</Label>
                <Value>{userInfo?.address || '설정되지 않음'}</Value>
              </InfoRow>

              <InfoRow>
                <Label>우편번호:</Label>
                <Value>{userInfo?.zipCode || '설정되지 않음'}</Value>
              </InfoRow>

              <InfoRow>
                <Label>소개:</Label>
                <Value>{userInfo?.bio || '설정되지 않음'}</Value>
              </InfoRow>

              <EditProfileButton onClick={() => setEditing(true)}>
                ✏️ 수정
              </EditProfileButton>
            </ProfileInfo>
          )}
        </ProfileSection>
      )}

      {tab === 'orders' && (
        <OrdersSection>
          <SectionTitle>주문 내역</SectionTitle>

          {orders.length === 0 ? (
            <EmptyMessage>주문 내역이 없습니다</EmptyMessage>
          ) : (
            orders.map((order) => (
              <OrderCard key={order._id}>
                <OrderHeader>
                  <OrderId>주문번호: {order._id.slice(-8)}</OrderId>
                  <OrderDate>{new Date(order.createdAt).toLocaleDateString('ko-KR')}</OrderDate>
                  <OrderStatus $status={order.status}>
                    {order.status === 'pending' && '대기 중'}
                    {order.status === 'paid' && '결제 완료'}
                    {order.status === 'shipped' && '배송 중'}
                    {order.status === 'delivered' && '배송 완료'}
                  </OrderStatus>
                </OrderHeader>

                <OrderItems>
                  {order.items.map((item, idx) => (
                    <OrderItem key={idx}>
                      <ItemName>{item.productName}</ItemName>
                      <ItemDetails>
                        수량: {item.quantity}개 | 가격: ₩{item.price.toLocaleString()}
                      </ItemDetails>
                    </OrderItem>
                  ))}
                </OrderItems>

                <OrderFooter>
                  <Address>배송지: {order.shippingAddress}</Address>
                  <Total>총액: ₩{order.totalPrice.toLocaleString()}</Total>
                </OrderFooter>
              </OrderCard>
            ))
          )}
        </OrdersSection>
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

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;

  &:hover {
    background: #e53e3e;
  }
`

const TabBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
`

const TabButton = styled.a<{ $active: boolean }>`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: ${(props) => (props.$active ? '#4299e1' : '#718096')};
  border-bottom: ${(props) => (props.$active ? '3px solid #4299e1' : 'none')};
  text-decoration: none;
  transition: all 0.3s;

  &:hover {
    color: #4299e1;
  }
`

const ProfileSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
`

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
`

const ProfileInfo = styled.div``

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
`

const Label = styled.span`
  font-weight: bold;
  color: #2d3748;
`

const Value = styled.span`
  color: #718096;
`

const EditProfileButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: bold;
  transition: all 0.3s;

  &:hover {
    background: #3182ce;
  }
`

const EditForm = styled.div``

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`

const SaveButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;

  &:hover {
    background: #38a169;
  }
`

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #e0e0e0;
  color: #2d3748;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;

  &:hover {
    background: #cbd5e0;
  }
`

const OrdersSection = styled.div``

const OrderCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`

const OrderId = styled.span`
  font-weight: bold;
  color: #2d3748;
`

const OrderDate = styled.span`
  color: #718096;
  font-size: 0.9rem;
`

const OrderStatus = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  background: ${(props) => {
    switch (props.$status) {
      case 'pending':
        return '#fef3c7'
      case 'paid':
        return '#dbeafe'
      case 'shipped':
        return '#dbeafe'
      case 'delivered':
        return '#dcfce7'
      default:
        return '#f3f4f6'
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case 'pending':
        return '#92400e'
      case 'paid':
        return '#1e40af'
      case 'shipped':
        return '#1e40af'
      case 'delivered':
        return '#166534'
      default:
        return '#374151'
    }
  }};
`

const OrderItems = styled.div`
  margin-bottom: 1rem;
`

const OrderItem = styled.div`
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 0.5rem;
`

const ItemName = styled.div`
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.25rem;
`

const ItemDetails = styled.div`
  font-size: 0.9rem;
  color: #718096;
`

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`

const Address = styled.div`
  font-size: 0.9rem;
  color: #718096;
`

const Total = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  color: #2d3748;
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
`