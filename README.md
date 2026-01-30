# Audition Hub (Vercel 배포용)

## 반영
- Instagram 탭 제거
- 오디컴퍼니 탭/수집 제거
- CJ ENM 제거
- 에이콤 등 EUC-KR/CP949 사이트 인코딩 깨짐 해결(자동 charset 감지 + iconv-lite 디코딩)
- OTR: selector 확장 + list 파라미터 보강으로 0건 문제 완화

## 실행
```bash
npm install
npm run dev
```
접속: http://localhost:3000

## 운영 팁
### 1) 자동 수집이 막히는 사이트가 있을 수 있음
- 일부 제작사/플랫폼은 **서버에서의 자동 요청을 정책적으로 제한(403 등)** 할 수 있습니다.
- 이 프로젝트는 차단 회피를 시도하지 않습니다. 대신 **/status** 페이지에서 실패 원인(403/429/URL 변경 등)을 확인할 수 있습니다.

### 2) Vercel에서 안정적으로 돌리기
- `/api/posts`는 `Cache-Control: s-maxage=<TTL>, stale-while-revalidate=86400` 헤더를 사용해 엣지 캐시가 되도록 했습니다.
- 동시에 여러 소스를 때리지 않도록 기본 동시성 2로 제한했습니다.

## 환경변수(.env)
```env
# (선택) 로그인 비밀번호. 비워두면 로그인 없이 열립니다.
AUDITION_HUB_PASSWORD=

# 캐시 TTL(초). Vercel에서 소스 호출 횟수를 줄이려면 900~3600 권장
CACHE_TTL_SECONDS=1800

# 수집 동시성/스태거(초 단위가 아님)
SCRAPE_CONCURRENCY=2
SCRAPE_STAGGER_MS=250

# fetch timeout(ms)
FETCH_TIMEOUT_MS=12000
```

## Vercel 배포
1) 깃허브에 푸시
2) Vercel Import → Framework: Next.js
3) Environment Variables에 위 .env 값 설정
4) Deploy
