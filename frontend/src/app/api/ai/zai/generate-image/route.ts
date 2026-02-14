import { NextResponse } from 'next/server';

const ZAI_IMAGE_ENDPOINT = 'https://api.z.ai/api/paas/v4/images/generations';
const DEFAULT_MODEL = 'glm-image';
const DEFAULT_SIZE = '1280x1280';
const ALLOWED_SIZES = new Set([
  '1280x1280',
  '1568x1056',
  '1056x1568',
  '1728x960',
  '960x1728',
  '1472x1088',
  '1088x1472',
]);

interface GenerateImageBody {
  prompt?: string;
  size?: string;
}

function isInsufficientBalanceMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('insufficient balance') ||
    normalized.includes('no resource package') ||
    normalized.includes('please recharge')
  );
}

function parseSize(value: string): { width: number; height: number } {
  const [rawWidth, rawHeight] = value.split('x');
  const width = Number(rawWidth) || 1280;
  const height = Number(rawHeight) || 1280;
  return { width, height };
}

function makeFallbackImage(prompt: string, size: string): string {
  const { width, height } = parseSize(size);
  const safePrompt = prompt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 90);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10141f"/>
      <stop offset="100%" stop-color="#232a3d"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="${Math.round(width * 0.18)}" cy="${Math.round(height * 0.18)}" r="${Math.round(Math.min(width, height) * 0.08)}" fill="#E882B2" opacity="0.25"/>
  <circle cx="${Math.round(width * 0.8)}" cy="${Math.round(height * 0.72)}" r="${Math.round(Math.min(width, height) * 0.12)}" fill="#7dd3fc" opacity="0.2"/>
  <text x="50%" y="45%" text-anchor="middle" fill="#f8fafc" font-family="'Noto Sans KR', sans-serif" font-size="${Math.max(24, Math.round(width * 0.03))}" font-weight="700">AI 생성 대체 이미지</text>
  <text x="50%" y="53%" text-anchor="middle" fill="#cbd5e1" font-family="'Noto Sans KR', sans-serif" font-size="${Math.max(14, Math.round(width * 0.015))}">잔액 부족으로 데모 이미지를 사용했습니다.</text>
  <foreignObject x="${Math.round(width * 0.15)}" y="${Math.round(height * 0.6)}" width="${Math.round(width * 0.7)}" height="${Math.round(height * 0.25)}">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Noto Sans KR',sans-serif;color:#94a3b8;font-size:${Math.max(12, Math.round(width * 0.012))}px;line-height:1.5;text-align:center;word-break:break-word;">
      ${safePrompt}
    </div>
  </foreignObject>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function allowBalanceFallback(): boolean {
  if (process.env.ZAI_ALLOW_BALANCE_FALLBACK?.toLowerCase() === 'true') {
    return true;
  }

  return (
    process.env.NEXT_PUBLIC_USE_MOCK !== 'false' ||
    process.env.NEXT_PUBLIC_AUTH_MODE?.toLowerCase() === 'mock'
  );
}

function normalizeApiKey(rawKey?: string): string {
  if (!rawKey) {
    return '';
  }

  const trimmed = rawKey.trim();
  const unquoted = trimmed
    .replace(/^"(.*)"$/, '$1')
    .replace(/^'(.*)'$/, '$1')
    .trim();

  if (unquoted.toLowerCase().startsWith('bearer ')) {
    return unquoted.slice(7).trim();
  }

  return unquoted;
}

function isPlaceholderKey(key: string): boolean {
  return key.toLowerCase().includes('z.ai key');
}

export async function POST(request: Request) {
  let body: GenerateImageBody;

  try {
    body = (await request.json()) as GenerateImageBody;
  } catch {
    return NextResponse.json({ error: '요청 본문을 해석할 수 없습니다.' }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 });
  }

  const size = body.size && ALLOWED_SIZES.has(body.size) ? body.size : DEFAULT_SIZE;
  const apiKey = normalizeApiKey(process.env.ZAI_API_KEY);
  if (!apiKey) {
    return NextResponse.json({ error: 'Z.AI API 키가 설정되어 있지 않습니다.' }, { status: 400 });
  }

  if (isPlaceholderKey(apiKey)) {
    return NextResponse.json(
      { error: 'Z.AI API 키가 예시값으로 설정되어 있습니다. frontend/.env.local의 ZAI_API_KEY를 실제 발급 키로 교체해주세요.' },
      { status: 400 }
    );
  }

  try {
    const zaiResponse = await fetch(ZAI_IMAGE_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        size,
      }),
    });

    const responseText = await zaiResponse.text();
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = null;
    }

    if (!zaiResponse.ok) {
      const upstreamMessage = parsed?.error?.message || parsed?.message || '';
      const upstreamCode = String(parsed?.error?.code || parsed?.code || '');
      if (typeof upstreamMessage === 'string' && upstreamMessage.toLowerCase().includes('authentication failed')) {
        return NextResponse.json(
          { error: 'Z.AI 인증에 실패했습니다. frontend/.env.local의 ZAI_API_KEY를 확인해주세요.' },
          { status: 401 }
        );
      }

      if (
        upstreamCode === '1113' ||
        upstreamCode === '1309' ||
        (typeof upstreamMessage === 'string' && isInsufficientBalanceMessage(upstreamMessage))
      ) {
        if (allowBalanceFallback()) {
          return NextResponse.json({
            url: makeFallbackImage(prompt, size),
            created: Math.floor(Date.now() / 1000),
            size,
            model: DEFAULT_MODEL,
            fallback: true,
            warning: 'Z.AI 생성 한도에 도달해 참고용 이미지를 제공했습니다.',
          });
        }

        return NextResponse.json(
          { error: 'Z.AI 잔액 또는 리소스 패키지가 부족합니다. 충전 후 다시 시도해주세요.' },
          { status: 402 }
        );
      }

      return NextResponse.json(
        {
          error: upstreamMessage || `이미지 생성 API 요청 실패 (${zaiResponse.status})`,
        },
        { status: zaiResponse.status }
      );
    }

    const imageUrl = parsed?.data?.[0]?.url;
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: '이미지 URL을 받지 못했습니다.' }, { status: 502 });
    }

    return NextResponse.json({
      url: imageUrl,
      created: parsed?.created || Math.floor(Date.now() / 1000),
      size,
      model: DEFAULT_MODEL,
    });
  } catch {
    return NextResponse.json(
      { error: '이미지 생성 중 네트워크 오류가 발생했습니다.' },
      { status: 502 }
    );
  }
}
