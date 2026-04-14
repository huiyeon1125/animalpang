export interface DefaultProduct {
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

export const defaultProducts: DefaultProduct[] = [
  {
    name: '프리미엄 강아지 사료',
    description: '영양 균형을 고려해 만든 대표 강아지 사료입니다.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
    category: '강아지 용품',
    stock: 20,
  },
  {
    name: '코듀로이 강아지 하네스',
    description: '산책할 때 편안하게 착용할 수 있는 부드러운 하네스입니다.',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1760596687389-93d4fcf1c776?w=400',
    category: '강아지 용품',
    stock: 16,
  },
  {
    name: '고양이 스크래처 타워',
    description: '스크래칭과 휴식을 동시에 즐길 수 있는 인기 타워입니다.',
    price: 52000,
    image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400',
    category: '고양이 용품',
    stock: 12,
  },
  {
    name: '강아지 장난감 세트',
    description: '물기 놀이와 노즈워크에 좋은 장난감을 한 세트로 담았습니다.',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400',
    category: '장난감',
    stock: 40,
  },
  {
    name: '코기 전용 침대',
    description: '짧은 다리 체형에 맞춰 편하게 쉴 수 있도록 만든 쿠션형 침대입니다.',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1760596687491-7b99fb80bb43?w=400',
    category: '강아지 용품',
    stock: 8,
  },
  {
    name: '고양이 터널 장난감',
    description: '호기심 많은 고양이를 위한 숨숨집 겸 놀이 터널입니다.',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1742565850085-bf02c1e7cba4?w=400',
    category: '장난감',
    stock: 22,
  },
]
