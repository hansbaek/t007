# Tire Metadata Operations Studio

타이어 연구소의 실차 시험 메타데이터를 통합 관리하기 위한 Next.js + shadcn UI 기반 운영 콘솔입니다. 의뢰, 평가, 결과 입력 세 파트를 하나의 화면에서 확인하며 Front/Rear Spec 조합, Test Order, 평가 시트 확장 필드, 결과 매핑 로직을 시각적으로 관리할 수 있습니다.

## 주요 기능

- **의뢰 파트**: Front/Rear Spec 매트릭스 기반으로 시험용 조합을 생성하고 Test Order를 순서, 수량, 일정과 함께 관리합니다.
- **평가 파트**: 평가 시트 확장 필드 선택, Test Order와 연계된 시트 메타데이터 확인, Parsing Set 수량 정책을 설정합니다.
- **결과 입력 파트**: 다중 파일 업로드 UI, Test Order ID 기반 결과 매핑 현황, 취소 이력 Audit Log 확인.
- **헤더 요약**: 프로젝트 KPI, 조합 수, 진행 현황, 데이터 품질 상태를 한눈에 제공합니다.

## 기술 스택

- Next.js App Router (TypeScript)
- Tailwind CSS & shadcn 스타일 컴포넌트 (Button, Card, Table 등)
- lucide-react 아이콘

## 개발 스크립트

> 패키지 설치를 완료한 뒤 아래 스크립트를 사용할 수 있습니다.

```bash
npm run dev     # 개발 서버 실행
npm run build   # 프로덕션 빌드
npm run start   # 빌드된 앱 실행
npm run lint    # ESLint 검사
```

## 구조

```
src/
  app/
    page.tsx       # 메인 운영 화면
    globals.css    # Tailwind 글로벌 스타일
  components/
    ui/            # shadcn 스타일 UI 컴포넌트 모음
  lib/
    utils.ts       # Tailwind className 유틸리티
```

## 참고

- 프로젝트는 의뢰-평가-결과 간 메타데이터 정합성을 강조하며, Test Order ID를 중심으로 한 매핑 전략을 시뮬레이션합니다.
- 실제 파일 업로드나 서버 통신은 포함되어 있지 않으며, UI 및 로직 프로토타입 구현에 집중합니다.
