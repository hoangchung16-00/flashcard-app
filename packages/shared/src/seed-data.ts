export interface SeedCard {
  id: string;
  front: string;
  back: string;
  /** Số ngày trước hạn ôn (0 = due hôm nay) */
  dueDaysAgo?: number;
}

export interface SeedDeck {
  id: string;
  title: string;
  description: string;
  cards: SeedCard[];
}

/** Dữ liệu mẫu — ID cố định để đồng bộ offline/online nhất quán */
export const SEED_DECKS: SeedDeck[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    title: 'Tiếng Anh hàng ngày',
    description: 'Từ vựng cơ bản dùng trong giao tiếp hằng ngày',
    cards: [
      {
        id: '22222222-2222-2222-2222-222222222201',
        front: 'Hello',
        back: 'Xin chào',
        dueDaysAgo: 0,
      },
      {
        id: '22222222-2222-2222-2222-222222222202',
        front: 'Thank you',
        back: 'Cảm ơn',
        dueDaysAgo: 0,
      },
      {
        id: '22222222-2222-2222-2222-222222222203',
        front: 'How are you?',
        back: 'Bạn khỏe không?',
        dueDaysAgo: 1,
      },
      {
        id: '22222222-2222-2222-2222-222222222204',
        front: 'Good morning',
        back: 'Chào buổi sáng',
        dueDaysAgo: 0,
      },
      {
        id: '22222222-2222-2222-2222-222222222205',
        front: 'See you later',
        back: 'Hẹn gặp lại',
      },
      {
        id: '22222222-2222-2222-2222-222222222206',
        front: 'Excuse me',
        back: 'Xin lỗi / Làm ơn',
        dueDaysAgo: 0,
      },
    ],
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    title: 'IELTS — Education',
    description: 'Từ vựng chủ đề Giáo dục cho IELTS',
    cards: [
      {
        id: '22222222-2222-2222-2222-222222222211',
        front: 'Curriculum',
        back: 'Chương trình giảng dạy',
        dueDaysAgo: 0,
      },
      {
        id: '22222222-2222-2222-2222-222222222212',
        front: 'Scholarship',
        back: 'Học bổng',
        dueDaysAgo: 0,
      },
      {
        id: '22222222-2222-2222-2222-222222222213',
        front: 'Tuition fee',
        back: 'Học phí',
        dueDaysAgo: 2,
      },
      {
        id: '22222222-2222-2222-2222-222222222214',
        front: 'Literacy',
        back: 'Khả năng đọc viết',
        dueDaysAgo: 0,
      },
      {
        id: '22222222-2222-2222-2222-222222222215',
        front: 'Graduate',
        back: 'Tốt nghiệp',
      },
      {
        id: '22222222-2222-2222-2222-222222222216',
        front: 'Compulsory education',
        back: 'Giáo dục bắt buộc',
        dueDaysAgo: 0,
      },
    ],
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    title: 'Lập trình cơ bản',
    description: 'Thuật ngữ lập trình phổ biến',
    cards: [
      {
        id: '22222222-2222-2222-2222-222222222221',
        front: 'Variable',
        back: 'Biến — lưu trữ dữ liệu có thể thay đổi',
        dueDaysAgo: 0,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        front: 'Function',
        back: 'Hàm — khối code tái sử dụng',
        dueDaysAgo: 0,
      },
      {
        id: '22222222-2222-2222-2222-222222222223',
        front: 'API',
        back: 'Application Programming Interface — giao diện gọi dịch vụ',
        dueDaysAgo: 1,
      },
      {
        id: '22222222-2222-2222-2222-222222222224',
        front: 'Database',
        back: 'Cơ sở dữ liệu',
        dueDaysAgo: 0,
      },
      {
        id: '22222222-2222-2222-2222-222222222225',
        front: 'Algorithm',
        back: 'Thuật toán — tập quy tắc giải quyết bài toán',
      },
    ],
  },
];

export const SEED_STORAGE_KEY = 'flashcard_demo_seeded_v1';
