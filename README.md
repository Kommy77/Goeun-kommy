# 🥬 FreshKeeper MVP Development

식재료 유통기한을 스마트하게 관리하고, 보유한 재료로 만들 수 있는 레시피를 추천받는 모바일 웹 애플리케이션입니다.

## 📋 프로젝트 개요

FreshKeeper는 가정 내 식재료 관리를 돕고 음식물 쓰레기를 줄이기 위한 MVP(Minimum Viable Product)입니다. 사용자는 냉장고와 냉동실의 식재료를 등록하고, 유통기한을 추적하며, 보유한 재료로 조리 가능한 레시피를 추천받을 수 있습니다.

### 주요 기능

- **식재료 등록 및 관리**: 식재료명, 유통기한, 보관 위치(냉장/냉동)를 등록
- **유통기한 상태 추적**: 자동으로 상태를 계산하여 표시
  - 🟢 여유: 유통기한까지 4일 이상
  - 🟡 임박: 유통기한까지 1-3일
  - 🔴 오늘: 유통기한 당일
  - ⚫ 초과: 유통기한 경과
- **맞춤 레시피 추천**: 보유한 식재료 기반으로 매칭률과 함께 레시피 제공
- **클라우드 데이터베이스**: Supabase PostgreSQL을 활용한 안정적인 데이터 저장

## 🛠️ 기술 스택

### Core
- **React** 18.3.1 - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** 6.3.5 - 빌드 도구 및 개발 서버

### Backend & Database
- **Supabase** - PostgreSQL 데이터베이스 및 실시간 구독
- **@supabase/supabase-js** - Supabase 클라이언트 라이브러리

### UI Components
- **Radix UI** - 접근성이 보장된 headless UI 컴포넌트
  - Accordion, Dialog, Dropdown Menu, Popover 등
- **Lucide React** - 아이콘 라이브러리
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **class-variance-authority** - 컴포넌트 variant 관리
- **tailwind-merge** / **clsx** - 클래스명 조합

### Additional Libraries
- **react-hook-form** - 폼 상태 관리
- **react-day-picker** - 날짜 선택기
- **recharts** - 차트 및 데이터 시각화
- **sonner** - 토스트 알림
- **cmdk** - 커맨드 팔레트
- **next-themes** - 테마 관리 (다크모드 지원)

## 🚀 실행 방법

### Supabase 설정 (필수)

프로젝트를 실행하기 전에 Supabase 데이터베이스를 설정해야 합니다.

#### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인
2. "New Project" 버튼 클릭
3. 프로젝트 이름과 데이터베이스 비밀번호 설정
4. 리전 선택 (권장: Northeast Asia - Seoul)
5. 프로젝트 생성 완료 대기 (약 2분 소요)

#### 2. 데이터베이스 스키마 생성

1. Supabase 대시보드에서 좌측 메뉴의 **SQL Editor** 클릭
2. 프로젝트 루트의 `supabase-schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. "Run" 버튼 클릭하여 실행

#### 3. 환경 변수 설정

1. Supabase 대시보드에서 **Settings** > **API** 메뉴로 이동
2. 다음 값들을 복사:
   - `Project URL` (VITE_SUPABASE_URL)
   - `anon public` key (VITE_SUPABASE_ANON_KEY)

3. 프로젝트 루트의 `.env.local` 파일을 열어 값 입력:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 로컬 개발 환경

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 확인**
   - `.env.local` 파일에 Supabase 인증 정보가 올바르게 설정되어 있는지 확인

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   - 기본 포트: `http://localhost:3000`
   - 브라우저가 자동으로 열립니다

4. **프로덕션 빌드**
   ```bash
   npm run build
   ```
   - 빌드 결과물은 `build/` 디렉토리에 생성됩니다

### 프리뷰 모드

빌드된 결과물을 로컬에서 미리보기:

```bash
npm run build
npx vite preview
```

## 📁 프로젝트 구조

```
FreshKeeper MVP Development/
├── src/
│   ├── components/
│   │   ├── ui/              # 재사용 가능한 UI 컴포넌트
│   │   │   ├── RecipeCard.tsx
│   │   │   ├── IngredientCard.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── ...
│   │   ├── Landing.tsx      # 랜딩 페이지
│   │   ├── Home.tsx         # 홈 화면
│   │   ├── AddIngredient.tsx # 식재료 추가
│   │   └── RecipeList.tsx   # 레시피 목록
│   ├── lib/
│   │   ├── supabase.ts      # Supabase 클라이언트 초기화
│   │   └── database.types.ts # 데이터베이스 타입 정의
│   ├── App.tsx              # 메인 앱 로직
│   ├── main.tsx             # 엔트리 포인트
│   └── index.css            # 글로벌 스타일
├── supabase-schema.sql      # Supabase 테이블 스키마
├── .env.local               # 환경 변수 (git에서 제외)
├── .env.example             # 환경 변수 예시
├── vite.config.ts           # Vite 설정
├── package.json
└── index.html
```

## 💾 데이터 관리

### Supabase PostgreSQL 데이터베이스

식재료 데이터는 Supabase의 PostgreSQL 데이터베이스에 저장됩니다.

**테이블 구조: `ingredients`**

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | UUID | 고유 식별자 (자동 생성) |
| `name` | TEXT | 식재료명 |
| `expiry_date` | DATE | 유통기한 |
| `storage` | TEXT | 보관 위치 ('냉장', '냉동') |
| `status` | TEXT | 상태 ('여유', '임박', '오늘', '초과') |
| `created_at` | TIMESTAMPTZ | 생성 시간 (자동 생성) |
| `user_id` | UUID | 사용자 ID (향후 인증 기능용, 현재는 NULL) |

**주요 기능:**
- ✅ 자동 상태 계산: 유통기한 기반으로 상태가 자동으로 계산되고 업데이트됩니다
- ✅ 실시간 동기화: Supabase 실시간 구독을 통해 여러 기기에서 데이터 동기화 가능
- ✅ RLS (Row Level Security): 보안을 위한 행 수준 보안 정책 적용
- ✅ 인덱싱: 빠른 검색을 위한 인덱스 설정

## 🔧 문제 해결

### 환경 변수 오류

**오류:** `Missing Supabase environment variables`

**해결 방법:**
1. `.env.local` 파일이 프로젝트 루트에 존재하는지 확인
2. 파일 내용에 `VITE_` 접두사가 포함되어 있는지 확인
3. 개발 서버를 재시작 (`Ctrl+C` 후 `npm run dev`)

### Supabase 연결 오류

**오류:** API 요청이 실패하거나 데이터가 로드되지 않음

**해결 방법:**
1. Supabase 대시보드에서 프로젝트가 활성화되어 있는지 확인
2. `supabase-schema.sql`이 정상적으로 실행되었는지 확인
3. API URL과 키가 올바른지 확인
4. 브라우저 개발자 도구(F12)의 Console 탭에서 오류 메시지 확인

### CORS 오류

Supabase는 기본적으로 모든 도메인에서의 요청을 허용합니다. CORS 오류가 발생하면 Supabase 대시보드의 Authentication > URL Configuration에서 사이트 URL을 확인하세요.

## 🎨 디자인

원본 Figma 디자인: [FreshKeeper MVP Development](https://www.figma.com/design/Xlz5pY5AyaVsqJBgky3rG1/FreshKeeper-MVP-Development)

## 🚀 향후 개발 계획

- [ ] 사용자 인증 기능 (Supabase Auth)
- [ ] 실시간 알림 (유통기한 임박 시)
- [ ] 레시피 API 연동
- [ ] PWA (Progressive Web App) 지원
- [ ] 다크 모드 구현
- [ ] 식재료 카테고리 분류
- [ ] 통계 및 분석 기능

## 📄 라이선스

This project is private.

## 🤝 기여

현재 MVP 개발 단계로, 내부 개발만 진행 중입니다.
