#!/usr/bin/env python3
"""PDF에서 이미지를 추출하여 디자인 폴더에 저장하는 스크립트"""

import fitz  # PyMuPDF
import os

def extract_images_from_pdf(pdf_path, output_folder):
    """PDF에서 모든 이미지를 추출"""
    
    # 출력 폴더 생성
    photos_folder = os.path.join(output_folder, "사진")
    images_folder = os.path.join(output_folder, "이미지")
    
    os.makedirs(photos_folder, exist_ok=True)
    os.makedirs(images_folder, exist_ok=True)
    
    # PDF 열기
    doc = fitz.open(pdf_path)
    
    photo_count = 0
    image_count = 0
    
    print(f"PDF 페이지 수: {len(doc)}")
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)
        
        for img_index, img_info in enumerate(image_list):
            xref = img_info[0]
            
            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                width = base_image["width"]
                height = base_image["height"]
                
                # 이미지 크기에 따라 분류
                # 사진: 큰 이미지 (보통 600x600 이상)
                # 이미지: 작은 이미지, 아이콘, 그래픽 요소
                
                if width >= 600 and height >= 600:
                    # 사진으로 분류
                    photo_count += 1
                    filename = f"사진_{page_num + 1:03d}_{photo_count:04d}.{image_ext}"
                    filepath = os.path.join(photos_folder, filename)
                else:
                    # 이미지로 분류
                    image_count += 1
                    filename = f"이미지_{page_num + 1:03d}_{image_count:04d}.{image_ext}"
                    filepath = os.path.join(images_folder, filename)
                
                with open(filepath, "wb") as f:
                    f.write(image_bytes)
                
                print(f"추출: {filename} ({width}x{height})")
                
            except Exception as e:
                print(f"페이지 {page_num + 1}, 이미지 {img_index} 추출 실패: {e}")
    
    doc.close()
    
    print(f"\n완료!")
    print(f"사진: {photo_count}개 -> {photos_folder}")
    print(f"이미지: {image_count}개 -> {images_folder}")

if __name__ == "__main__":
    pdf_path = "슈퍼 리얼 섹시 AI인플루언서 가이드북50 .pdf"
    output_folder = "디자인"
    
    extract_images_from_pdf(pdf_path, output_folder)
