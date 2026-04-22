# 직원식당 만족도 조사 (Vercel + Supabase)

`cafeteria_survey.html` 디자인/플로우를 그대로 유지하면서, 운영용으로 파일을 분리한 버전입니다.

## 1) Supabase 준비

1. Supabase 프로젝트 생성
2. `SQL Editor`에서 `supabase/schema.sql` 실행
3. `Settings > API`에서 아래 값 복사
   - Project URL
   - anon public key

## 2) 로컬 실행

정적 사이트라서 아무 정적 서버로 실행하면 됩니다.

```bash
npx serve .
```

## 3) Vercel 배포

1. Vercel에 이 폴더를 새 프로젝트로 Import
2. Build 관련 설정은 기본값 사용 (Framework Preset: `Other`)
3. Environment Variables 추가
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Deploy

## 4) 런타임 환경변수 방식

이 프로젝트는 `api/runtime-config.js`가 Vercel 환경변수를 읽어
`window.__RUNTIME_CONFIG__`로 자동 주입합니다.

즉, 배포 시에는 Vercel에 환경변수만 넣으면 되고, 클라이언트 코드 수정은 필요 없습니다.

## 5) 권장 개선 (선택)

- 익명 남용 방지를 위해 Supabase에 rate limiting 또는 captcha 추가
- 운영 대시보드용 조회 API는 `service_role` 키를 서버에서만 사용
