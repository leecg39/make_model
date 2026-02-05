#!/usr/bin/env python3
"""PDF에서 프롬프트를 추출하여 JSON 파일로 저장하는 스크립트"""

import fitz
import json
import os
import re

def extract_prompts_from_pdf(pdf_path, output_folder):
    """PDF에서 모든 프롬프트를 추출"""
    
    os.makedirs(output_folder, exist_ok=True)
    
    doc = fitz.open(pdf_path)
    prompts = []
    
    print(f"PDF 페이지 수: {len(doc)}")
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text().strip()
        
        if not text:
            continue
        
        # "인공지능 한이룸" 헤더 제거
        text = text.replace("인공지능 한이룸", "").strip()
        
        # 첫 페이지(표지) 건너뛰기
        if "슈퍼 리얼 SEXY" in text or "가이드북" in text:
            continue
        
        # 프롬프트인지 확인 (A로 시작하고 Korean woman이 포함된 경우)
        if text.startswith("A ") and "Korean woman" in text:
            prompt_data = {
                "id": len(prompts) + 1,
                "page": page_num + 1,
                "prompt": text,
                "category": extract_category(text)
            }
            prompts.append(prompt_data)
            print(f"페이지 {page_num + 1}: 프롬프트 추출됨")
    
    doc.close()
    
    # 전체 프롬프트를 하나의 JSON 파일로 저장
    all_prompts_path = os.path.join(output_folder, "all_prompts.json")
    with open(all_prompts_path, "w", encoding="utf-8") as f:
        json.dump({
            "total": len(prompts),
            "source": pdf_path,
            "prompts": prompts
        }, f, ensure_ascii=False, indent=2)
    
    # 개별 프롬프트도 각각 파일로 저장
    for prompt in prompts:
        filename = f"prompt_{prompt['id']:03d}.json"
        filepath = os.path.join(output_folder, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(prompt, f, ensure_ascii=False, indent=2)
    
    print(f"\n완료!")
    print(f"총 {len(prompts)}개의 프롬프트 추출")
    print(f"저장 위치: {output_folder}")
    print(f"- all_prompts.json (전체)")
    print(f"- prompt_001.json ~ prompt_{len(prompts):03d}.json (개별)")

def extract_category(text):
    """프롬프트에서 장소/상황 카테고리 추출"""
    locations = {
        "kitchen": "주방",
        "laundromat": "세탁실",
        "fitting room": "피팅룸",
        "office": "사무실",
        "bedroom": "침실",
        "bathroom": "욕실",
        "living room": "거실",
        "balcony": "발코니",
        "rooftop": "옥상",
        "cafe": "카페",
        "studio": "스튜디오",
        "gym": "헬스장",
        "pool": "수영장",
        "beach": "해변",
        "hotel": "호텔",
        "bar": "바",
        "restaurant": "레스토랑"
    }
    
    text_lower = text.lower()
    for eng, kor in locations.items():
        if eng in text_lower:
            return kor
    return "기타"

if __name__ == "__main__":
    pdf_path = "슈퍼 리얼 섹시 AI인플루언서 가이드북50 .pdf"
    output_folder = "prompt"
    
    extract_prompts_from_pdf(pdf_path, output_folder)
