# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDF 가이드북에서 AI 이미지 생성용 프롬프트와 참고 이미지를 추출하는 유틸리티 스크립트 모음입니다.

## Commands

```bash
# PDF에서 이미지 추출 (PyMuPDF 필요)
python extract_images.py

# PDF에서 프롬프트 추출
python extract_prompts.py
```

## Dependencies

- PyMuPDF (`fitz`): `pip install pymupdf`

## Architecture

### 추출 스크립트
- `extract_images.py`: PDF에서 이미지를 추출하여 크기 기준으로 분류 (600x600 이상 → 사진, 미만 → 이미지)
- `extract_prompts.py`: PDF에서 "A "로 시작하고 "Korean woman"을 포함하는 텍스트를 프롬프트로 인식하여 추출

### 출력 구조
- `picture/model/`: 추출된 참고 이미지
- `prompt/`: 추출된 프롬프트 (JSON 개별 파일 + all_prompts.json 통합 파일 + prompts.txt 텍스트 버전)

### 프롬프트 JSON 스키마
```json
{
  "id": 1,
  "page": 2,
  "prompt": "A seductive Korean woman...",
  "category": "주방"
}
```

카테고리는 프롬프트 내 장소 키워드(kitchen, cafe, pool 등)를 자동 감지하여 한글로 변환됩니다.
