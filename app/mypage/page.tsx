'use client'

import Link from 'next/link'
import { Heart, MapPin, Package, Phone, Sparkles } from 'lucide-react'
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

interface WishlistItem {
  productId: {
    _id: string
    name: string
    description: string
    price: number
    image?: string
    category: string
    stock: number
  }
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
  const [userName, setUserName] = useState('고객')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
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
    const storedName = localStorage.getItem('userName')

    if (!id) {
      alert('로그인이 필요합니다.')
      window.location.href = '/auth'
      return
    }

    setUserId(id)
    setUserName(storedName || '고객')
    fetchData(id)
  }, [])

  const fetchData = async (id: string) => {
    try {
      const [userRes, ordersRes, wishlistRes] = await Promise.all([
        fetch(`/api/userinfo/${id}`),
        fetch(`/api/orders/${id}`),
        fetch(`/api/wishlist/${id}`),
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

      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json()
        setWishlist(wishlistData.items || [])
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
        setMessage('프로필이 저장되었습니다.')
        setEditing(false)
        setUserInfo(formData)
      } else {
        setMessage('저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      setMessage('저장 중 오류가 발생했습니다.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    window.location.href = '/auth'
  }

  const handleRemoveWishlist = async (productId: string) => {
    if (!userId) return

    try {
      const res = await fetch(`/api/wishlist/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      const data = await res.json()

      if (res.ok) {
        setWishlist(data.wishlist.items || [])
      } else {
        alert(data.message || '찜 해제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to remove wishlist item:', error)
      alert('찜 해제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return <LoadingText>로딩 중...</LoadingText>
  }

  return (
    <PageShell>
      <Container>
        <HeroCard>
          <HeroBadge>
            <Sparkles size={14} />
            My PetMart
          </HeroBadge>
          <HeroGrid>
            <HeroCopy>
              <HeroTitle>{userName}님의 아늑한 공간</HeroTitle>
              <HeroDescription>
                쇼핑 기록과 찜한 상품, 배송 정보를 한곳에서 편하게 관리해보세요.
              </HeroDescription>
              <HeroActions>
                <HomeLink href="/">메인으로</HomeLink>
                <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
              </HeroActions>
            </HeroCopy>
            <HeroStats>
              <StatCard>
                <StatIcon $tone="pink">
                  <Heart size={18} />
                </StatIcon>
                <StatLabel>찜한 상품</StatLabel>
                <StatValue>{wishlist.length}개</StatValue>
              </StatCard>
              <StatCard>
                <StatIcon $tone="blue">
                  <Package size={18} />
                </StatIcon>
                <StatLabel>주문 내역</StatLabel>
                <StatValue>{orders.length}건</StatValue>
              </StatCard>
              <StatCard>
                <StatIcon $tone="yellow">
                  <MapPin size={18} />
                </StatIcon>
                <StatLabel>주 활동 지역</StatLabel>
                <StatValue>{userInfo?.city || '미설정'}</StatValue>
              </StatCard>
              <StatCard>
                <StatIcon $tone="mint">
                  <Phone size={18} />
                </StatIcon>
                <StatLabel>연락처</StatLabel>
                <StatValue>{userInfo?.phone || '미설정'}</StatValue>
              </StatCard>
            </HeroStats>
          </HeroGrid>
        </HeroCard>

        <TabBar>
          <TabButton $active={tab === 'profile'} href="?tab=profile">프로필</TabButton>
          <TabButton $active={tab === 'orders'} href="?tab=orders">주문 내역</TabButton>
          <TabButton $active={tab === 'wishlist'} href="?tab=wishlist">
            찜한 상품
            {wishlist.length > 0 && <TabCount>{wishlist.length}</TabCount>}
          </TabButton>
        </TabBar>

        {tab === 'profile' && (
          <SectionCard>
            <SectionHeader>
              <div>
                <SectionEyebrow>Profile</SectionEyebrow>
                <SectionTitle>내 정보</SectionTitle>
              </div>
              {!editing && <EditButton onClick={() => setEditing(true)}>정보 수정</EditButton>}
            </SectionHeader>

            {editing ? (
              <EditForm>
                <FormGrid>
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
                    <Label>우편번호</Label>
                    <Input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="12345"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>주소</Label>
                    <TextArea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="상세 주소를 입력하세요"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>소개</Label>
                    <TextArea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="반려동물과 취향을 가볍게 소개해보세요"
                    />
                  </FormGroup>
                </FormGrid>

                <ButtonGroup>
                  <SaveButton onClick={handleSaveProfile}>저장</SaveButton>
                  <CancelButton onClick={() => setEditing(false)}>취소</CancelButton>
                </ButtonGroup>
              </EditForm>
            ) : (
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>전화번호</InfoLabel>
                  <Value>{userInfo?.phone || '설정되지 않음'}</Value>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>도시</InfoLabel>
                  <Value>{userInfo?.city || '설정되지 않음'}</Value>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>주소</InfoLabel>
                  <Value>{userInfo?.address || '설정되지 않음'}</Value>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>우편번호</InfoLabel>
                  <Value>{userInfo?.zipCode || '설정되지 않음'}</Value>
                </InfoItem>
                <InfoItem $wide>
                  <InfoLabel>소개</InfoLabel>
                  <Value>{userInfo?.bio || '설정되지 않음'}</Value>
                </InfoItem>
              </InfoGrid>
            )}

            {message && <Message>{message}</Message>}
          </SectionCard>
        )}

        {tab === 'orders' && (
          <SectionCard>
            <SectionHeader>
              <div>
                <SectionEyebrow>Orders</SectionEyebrow>
                <SectionTitle>주문 내역</SectionTitle>
              </div>
            </SectionHeader>

            {orders.length > 0 ? (
              <OrdersList>
                {orders.map((order) => (
                  <OrderCard key={order._id}>
                    <OrderHeader>
                      <OrderDate>{new Date(order.createdAt).toLocaleDateString()}</OrderDate>
                      <OrderStatus $status={order.status}>{order.status}</OrderStatus>
                    </OrderHeader>
                    <OrderInfo>
                      <span>주문 상품 수: {order.items.length}개</span>
                      <span>총 결제 금액: {order.totalPrice.toLocaleString()}원</span>
                      <span>배송지: {order.shippingAddress || '배송지 정보 없음'}</span>
                    </OrderInfo>
                  </OrderCard>
                ))}
              </OrdersList>
            ) : (
              <EmptyState>
                <EmptyTitle>아직 주문 내역이 없어요</EmptyTitle>
                <EmptyText>메인에서 마음에 드는 상품을 담고 첫 주문을 시작해보세요.</EmptyText>
                <SoftLink href="/">메인으로 가기</SoftLink>
              </EmptyState>
            )}
          </SectionCard>
        )}

        {tab === 'wishlist' && (
          <SectionCard>
            <SectionHeader>
              <div>
                <SectionEyebrow>Wishlist</SectionEyebrow>
                <SectionTitle>찜한 상품</SectionTitle>
              </div>
            </SectionHeader>

            {wishlist.length > 0 ? (
              <WishlistGrid>
                {wishlist.map((item) => (
                  <WishlistCard key={item.productId._id}>
                    <WishlistImage $image={item.productId.image} />
                    <WishlistContent>
                      <WishlistCategory>
                        <Heart size={14} className="fill-red-500 text-red-500" />
                        {item.productId.category}
                      </WishlistCategory>
                      <WishlistName>{item.productId.name}</WishlistName>
                      <WishlistDescription>{item.productId.description}</WishlistDescription>
                      <WishlistFooter>
                        <WishlistPrice>{item.productId.price.toLocaleString()}원</WishlistPrice>
                        <RemoveWishButton onClick={() => handleRemoveWishlist(item.productId._id)}>
                          찜 해제
                        </RemoveWishButton>
                      </WishlistFooter>
                    </WishlistContent>
                  </WishlistCard>
                ))}
              </WishlistGrid>
            ) : (
              <EmptyState>
                <EmptyTitle>아직 찜한 상품이 없어요</EmptyTitle>
                <EmptyText>마음에 드는 상품에 하트를 눌러 두고 천천히 비교해보세요.</EmptyText>
                <SoftLink href="/">메인으로 가기</SoftLink>
              </EmptyState>
            )}
          </SectionCard>
        )}
      </Container>
    </PageShell>
  )
}

const PageShell = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(253, 230, 138, 0.5), transparent 28%),
    radial-gradient(circle at top right, rgba(251, 207, 232, 0.45), transparent 32%),
    linear-gradient(180deg, #fffaf5 0%, #fffefe 42%, #f7fbff 100%);
  padding: 32px 20px 56px;
`

const Container = styled.div`
  width: min(1120px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 24px;
`

const HeroCard = styled.section`
  position: relative;
  overflow: hidden;
  padding: 28px;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(255, 248, 236, 0.96) 0%, rgba(255, 255, 255, 0.98) 42%, rgba(239, 246, 255, 0.96) 100%);
  border: 1px solid rgba(255, 218, 185, 0.85);
  box-shadow: 0 28px 60px rgba(236, 177, 124, 0.14);

  &::after {
    content: '';
    position: absolute;
    right: -44px;
    top: -38px;
    width: 190px;
    height: 190px;
    border-radius: 999px;
    background: rgba(255, 210, 179, 0.28);
  }
`

const HeroBadge = styled.div`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #b9733d;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.03em;
`

const HeroGrid = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.9fr);
  gap: 22px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`

const HeroCopy = styled.div`
  display: grid;
  align-content: center;
  gap: 14px;
`

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.08;
  color: #2f2a4a;
`

const HeroDescription = styled.p`
  margin: 0;
  max-width: 620px;
  color: #6f6a86;
  font-size: 1rem;
  line-height: 1.7;
`

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
`

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`

const StatCard = styled.div`
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(255, 231, 214, 0.9);
  box-shadow: 0 14px 30px rgba(255, 201, 154, 0.12);
`

const StatIcon = styled.div<{ $tone: 'pink' | 'blue' | 'yellow' | 'mint' }>`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  margin-bottom: 12px;
  color: #514669;
  background: ${(props) => {
    if (props.$tone === 'pink') return 'linear-gradient(135deg, #ffd9e8 0%, #ffeef5 100%)'
    if (props.$tone === 'blue') return 'linear-gradient(135deg, #d8ebff 0%, #eef7ff 100%)'
    if (props.$tone === 'yellow') return 'linear-gradient(135deg, #ffe8ba 0%, #fff7de 100%)'
    return 'linear-gradient(135deg, #d9f7ed 0%, #effcf7 100%)'
  }};
`

const StatLabel = styled.div`
  color: #8b84a2;
  font-size: 0.88rem;
  margin-bottom: 6px;
`

const StatValue = styled.div`
  color: #2f2a4a;
  font-size: 1.05rem;
  font-weight: 800;
`

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 0.9rem 1.25rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffb370 0%, #ff8f72 100%);
  color: white;
  font-weight: 700;
  box-shadow: 0 16px 32px rgba(255, 146, 108, 0.24);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 36px rgba(255, 146, 108, 0.3);
  }
`

const LogoutButton = styled.button`
  min-width: 120px;
  padding: 0.9rem 1.25rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #6c6586;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(222, 218, 235, 0.9);
  transition: transform 0.2s ease, background 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: white;
  }
`

const TabBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

const TabButton = styled.a<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.25rem;
  border-radius: 999px;
  font-weight: 700;
  color: ${(props) => (props.$active ? '#2f2a4a' : '#7d7692')};
  background: ${(props) => (props.$active ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 250, 245, 0.8)')};
  box-shadow: ${(props) => (props.$active ? '0 14px 28px rgba(255, 198, 153, 0.16)' : 'inset 0 0 0 1px rgba(236, 228, 221, 0.9)')};
  transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    color: #2f2a4a;
  }
`

const TabCount = styled.span`
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: #ff7e8a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
`

const SectionCard = styled.section`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 28px;
  border: 1px solid rgba(240, 231, 224, 0.95);
  box-shadow: 0 20px 50px rgba(226, 205, 188, 0.14);
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const SectionEyebrow = styled.div`
  color: #c18f62;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
`

const SectionTitle = styled.h2`
  margin: 0;
  color: #2f2a4a;
  font-size: 1.6rem;
`

const EditForm = styled.div`
  display: grid;
  gap: 1.5rem;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 700;
  color: #5b5673;
`

const Input = styled.input`
  padding: 0.95rem 1rem;
  border: 1px solid #ece4df;
  border-radius: 16px;
  font-size: 1rem;
  color: #2f2a4a;
  background: #fffdfb;

  &:focus {
    outline: none;
    border-color: #ffb683;
    box-shadow: 0 0 0 4px rgba(255, 182, 131, 0.16);
  }
`

const TextArea = styled.textarea`
  padding: 0.95rem 1rem;
  border: 1px solid #ece4df;
  border-radius: 16px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  color: #2f2a4a;
  background: #fffdfb;

  &:focus {
    outline: none;
    border-color: #ffb683;
    box-shadow: 0 0 0 4px rgba(255, 182, 131, 0.16);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

const SaveButton = styled.button`
  padding: 0.9rem 1.4rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffb370 0%, #ff8f72 100%);
  color: white;
  font-weight: 700;
`

const CancelButton = styled.button`
  padding: 0.9rem 1.4rem;
  border: none;
  border-radius: 999px;
  background: #ebe7f5;
  color: #5e5776;
  font-weight: 700;
`

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const InfoItem = styled.div<{ $wide?: boolean }>`
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fffaf5 0%, #ffffff 100%);
  border: 1px solid #f1e7de;
  min-height: 120px;
  ${(props) => props.$wide && 'grid-column: 1 / -1;'}
`

const InfoLabel = styled.div`
  font-weight: 700;
  color: #8f89a5;
  margin-bottom: 10px;
`

const Value = styled.p`
  margin: 0;
  color: #2f2a4a;
  line-height: 1.7;
`

const EditButton = styled.button`
  padding: 0.85rem 1.2rem;
  border: none;
  border-radius: 999px;
  background: #eef5ff;
  color: #376996;
  font-weight: 700;
`

const Message = styled.div`
  margin-top: 1.25rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: #eef8ff;
  color: #2b6cb0;
`

const OrdersList = styled.div`
  display: grid;
  gap: 14px;
`

const OrderCard = styled.div`
  padding: 1.35rem;
  border-radius: 22px;
  border: 1px solid #efe5dd;
  background: linear-gradient(180deg, #fffdfa 0%, #ffffff 100%);
`

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`

const OrderDate = styled.div`
  font-weight: 700;
  color: #2f2a4a;
`

const OrderStatus = styled.div<{ $status: string }>`
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  background: ${(props) => (props.$status === 'completed' ? '#daf5df' : '#ffe7d6')};
  color: ${(props) => (props.$status === 'completed' ? '#21603b' : '#8d4b1e')};
`

const OrderInfo = styled.div`
  display: grid;
  gap: 0.45rem;
  color: #696381;
  line-height: 1.6;
`

const WishlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`

const WishlistCard = styled.div`
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid #f1e6dc;
  background: linear-gradient(180deg, #fffdfb 0%, #ffffff 100%);
  box-shadow: 0 16px 36px rgba(241, 218, 199, 0.16);
`

const WishlistImage = styled.div<{ $image?: string }>`
  width: 100%;
  height: 190px;
  background: ${(props) =>
    props.$image
      ? `url(${props.$image}) center/cover no-repeat`
      : 'linear-gradient(135deg, #ffd5b5 0%, #ffe8d7 52%, #dcefff 100%)'};
`

const WishlistContent = styled.div`
  padding: 1rem;
`

const WishlistCategory = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  color: #d15b73;
  margin-bottom: 0.6rem;
  font-weight: 700;
`

const WishlistName = styled.h3`
  font-size: 1.04rem;
  color: #2f2a4a;
  margin: 0 0 0.5rem;
`

const WishlistDescription = styled.p`
  color: #786f8f;
  font-size: 0.94rem;
  line-height: 1.6;
  margin: 0 0 1rem;
`

const WishlistFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`

const WishlistPrice = styled.div`
  font-weight: 800;
  color: #2f2a4a;
`

const RemoveWishButton = styled.button`
  padding: 0.6rem 0.95rem;
  border: none;
  border-radius: 999px;
  background: #ffe2e8;
  color: #c44f68;
  font-weight: 700;
`

const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  border-radius: 24px;
  text-align: center;
  background: linear-gradient(180deg, #fff9f3 0%, #fffefe 100%);
  border: 1px dashed #efdccc;
`

const EmptyTitle = styled.h3`
  margin: 0 0 0.6rem;
  color: #2f2a4a;
  font-size: 1.2rem;
`

const EmptyText = styled.p`
  margin: 0 auto 1rem;
  max-width: 420px;
  color: #7a728e;
  line-height: 1.7;
`

const SoftLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.2rem;
  border-radius: 999px;
  background: #fff;
  color: #376996;
  font-weight: 700;
  box-shadow: inset 0 0 0 1px #dce8f8;
`

const LoadingText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: #5e5776;
  font-size: 1.1rem;
`
