export const measuredResults = [
  {
    value: '34 → 84',
    label: 'Lighthouse Performance',
    detail: '기존 U+모아tv 개발 환경',
    summary: '렌더링과 요청 병목을 측정해 성능 점수를 개선했습니다.',
    logHref: '/log/utv-mobile-home-performance-app-router',
  },
  {
    value: '12.2s → 1.3s',
    label: 'LCP',
    detail: '핵심 패널과 이미지 요청 개선',
    summary: '사용자가 주요 콘텐츠를 확인하기까지의 시간을 줄였습니다.',
    logHref: '/log/utv-mobile-home-performance-app-router',
  },
  {
    value: '155MB → 93MB',
    label: 'Node.js heapUsed',
    detail: '동일한 로컬 반복 요청 기준',
    summary: '메모리 생명주기를 추적해 서버의 반복 요청 안정성을 높였습니다.',
    logHref: '/log/nextjs-ssr-queryclient-gctime-oom',
  },
] as const
