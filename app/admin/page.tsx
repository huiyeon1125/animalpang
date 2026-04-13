'use client'

import { useEffect, useState, Suspense } from 'react'
import styled from 'styled-components'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  image?: string
}

export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingText>로딩 중...</LoadingText>}>
      <AdminContent />
    </Suspense>
  )
}

function AdminContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  })

  useEffect(() => {
    const id = localStorage.getItem('userId')
    if (!id) {
      alert('로그인이 필요합니다')
      window.location.href = '/auth'
      return
    }

    setUserId(id)
    fetchProducts()
  }, [])

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

  const handleAddProduct = async () => {
    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.stock) {
      setMessage('✗ 모든 필드를 입력하세요')
      return
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          createdBy: userId,
        }),
      })

      if (res.ok) {
        setMessage('✓ 상품이 등록되었습니다')
        setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' })
        setShowForm(false)
        fetchProducts()
      } else {
        setMessage('✗ 상품 등록 실패')
      }
    } catch (error) {
      console.error('Failed to add product:', error)
      setMessage('✗ 등록 중 오류 발생')
    }
  }

  const handleUpdateProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      })

      if (res.ok) {
        setMessage('✓ 상품이 수정되었습니다')
        setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' })
        setEditingId(null)
        fetchProducts()
      } else {
        setMessage('✗ 수정 실패')
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      setMessage('✗ 수정 중 오류 발생')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('✓ 상품이 삭제되었습니다')
        fetchProducts()
      } else {
        setMessage('✗ 삭제 실패')
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      setMessage('✗ 삭제 중 오류 발생')
    }
  }

  const startEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image || '',
    })
    setEditingId(product._id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' })
    setShowForm(false)
    setEditingId(null)
  }

  if (loading) {
    return <LoadingText>로딩 중...</LoadingText>
  }

  return (
    <Container>
      <Header>
        <Title>🛠️ 관리자 패널</Title>
        <BackButton href="/products">← 돌아가기</BackButton>
      </Header>

      <ControlPanel>
        {!showForm ? (
          <AddButton onClick={() => setShowForm(true)}>+ 새 상품 등록</AddButton>
        ) : (
          <FormContainer>
            <FormTitle>{editingId ? '상품 수정' : '새 상품 등록'}</FormTitle>

            <FormGroup>
              <Label>상품명 *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="상품명"
              />
            </FormGroup>

            <FormGroup>
              <Label>설명 *</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="상품 설명"
                rows={3}
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>가격 (원) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="10000"
                />
              </FormGroup>

              <FormGroup>
                <Label>카테고리 *</Label>
                <Input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="사료"
                />
              </FormGroup>

              <FormGroup>
                <Label>재고 *</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="50"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>이미지 URL</Label>
              <Input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </FormGroup>

            {message && (
              <MessageBox $isSuccess={message.includes('✓')}>
                {message}
              </MessageBox>
            )}

            <ButtonGroup>
              <SubmitButton onClick={() => editingId ? handleUpdateProduct(editingId) : handleAddProduct()}>
                {editingId ? '수정' : '등록'}
              </SubmitButton>
              <CancelButton onClick={resetForm}>취소</CancelButton>
            </ButtonGroup>
          </FormContainer>
        )}
      </ControlPanel>

      <ProductsSection>
        <SectionTitle>상품 목록 ({products.length}개)</SectionTitle>

        {products.length === 0 ? (
          <EmptyMessage>등록된 상품이 없습니다</EmptyMessage>
        ) : (
          <ProductTable>
            <thead>
              <tr>
                <th>상품명</th>
                <th>설명</th>
                <th>가격</th>
                <th>카테고리</th>
                <th>재고</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.description.slice(0, 30)}...</td>
                  <td>₩{product.price.toLocaleString()}</td>
                  <td>{product.category}</td>
                  <td>{product.stock}</td>
                  <td>
                    <ActionButtons>
                      <EditBtn onClick={() => startEdit(product)}>수정</EditBtn>
                      <DeleteBtn onClick={() => handleDeleteProduct(product._id)}>삭제</DeleteBtn>
                    </ActionButtons>
                  </td>
                </tr>
              ))}
            </tbody>
          </ProductTable>
        )}
      </ProductsSection>
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

const BackButton = styled.a`
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

const ControlPanel = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const AddButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #38a169;
  }
`

const FormContainer = styled.div``

const FormTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2d3748;
  font-weight: 600;
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
  resize: vertical;

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

const SubmitButton = styled.button`
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

const ProductsSection = styled.div``

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
`

const ProductTable = styled.table`
  width: 100%;
  background: white;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  thead {
    background: #2d3748;
    color: white;
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: #f9f9f9;
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`

const EditBtn = styled.button`
  padding: 0.5rem 1rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;

  &:hover {
    background: #3182ce;
  }
`

const DeleteBtn = styled.button`
  padding: 0.5rem 1rem;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;

  &:hover {
    background: #e53e3e;
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
`