"""Mock data for AI Model Marketplace.

56개의 실제 모델 이미지를 기반으로 12개의 AI 모델 Mock 데이터 생성.
이미지 경로: /picture/model/사진_XXX_YYYY.png

Usage:
    python -m app.db.seed_data
"""

import uuid
from datetime import datetime, timedelta
import random

# ─────────────────────────────────────────────────────────────────────────────
# Mock Users (Creators)
# ─────────────────────────────────────────────────────────────────────────────

MOCK_CREATORS = [
    {
        "id": "c1000000-0000-0000-0000-000000000001",
        "email": "creator1@example.com",
        "nickname": "아이리스 스튜디오",
        "role": "creator",
        "profile_image": None,
        "company_name": "Iris Studio",
    },
    {
        "id": "c1000000-0000-0000-0000-000000000002",
        "email": "creator2@example.com",
        "nickname": "루나 크리에이티브",
        "role": "creator",
        "profile_image": None,
        "company_name": "Luna Creative",
    },
    {
        "id": "c1000000-0000-0000-0000-000000000003",
        "email": "creator3@example.com",
        "nickname": "스텔라 AI",
        "role": "creator",
        "profile_image": None,
        "company_name": "Stella AI",
    },
    {
        "id": "c1000000-0000-0000-0000-000000000004",
        "email": "creator4@example.com",
        "nickname": "노바 디자인",
        "role": "creator",
        "profile_image": None,
        "company_name": "Nova Design",
    },
]

MOCK_BRANDS = [
    {
        "id": "b2000000-0000-0000-0000-000000000001",
        "email": "brand1@example.com",
        "nickname": "패션브랜드A",
        "role": "brand",
        "profile_image": None,
        "company_name": "Fashion Brand A Inc.",
    },
    {
        "id": "b2000000-0000-0000-0000-000000000002",
        "email": "brand2@example.com",
        "nickname": "뷰티브랜드B",
        "role": "brand",
        "profile_image": None,
        "company_name": "Beauty Brand B Corp.",
    },
]

# ─────────────────────────────────────────────────────────────────────────────
# Mock AI Models with real images from /picture/model/
# ─────────────────────────────────────────────────────────────────────────────

# Image files grouped by model (4-5 images per model)
IMAGE_BASE_PATH = "/picture/model"

MOCK_AI_MODELS = [
    # Model 1: 캐주얼 여성 20대
    {
        "id": "m0000000-0000-0000-0000-000000000001",
        "creator_id": "c1000000-0000-0000-0000-000000000001",
        "name": "소희",
        "description": "트렌디하고 자연스러운 캐주얼 룩의 AI 모델입니다. 데일리웨어, 스트릿 패션 촬영에 적합합니다.",
        "style": "casual",
        "gender": "female",
        "age_range": "20s",
        "view_count": 1523,
        "rating": 4.8,
        "status": "active",
        "tags": ["캐주얼", "데일리룩", "스트릿", "트렌디"],
        "images": [
            {"file": "사진_001_0001.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_002_0002.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_003_0003.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_004_0004.png", "order": 4, "is_thumbnail": False},
            {"file": "사진_005_0005.png", "order": 5, "is_thumbnail": False},
        ],
    },
    # Model 2: 포멀 여성 30대
    {
        "id": "m0000000-0000-0000-0000-000000000002",
        "creator_id": "c1000000-0000-0000-0000-000000000001",
        "name": "유진",
        "description": "세련되고 우아한 비즈니스 룩 전문 AI 모델입니다. 오피스웨어, 정장 화보에 완벽합니다.",
        "style": "formal",
        "gender": "female",
        "age_range": "30s",
        "view_count": 982,
        "rating": 4.6,
        "status": "active",
        "tags": ["포멀", "비즈니스", "오피스", "세련된"],
        "images": [
            {"file": "사진_006_0006.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_007_0007.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_008_0008.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_009_0009.png", "order": 4, "is_thumbnail": False},
        ],
    },
    # Model 3: 스포티 여성 20대
    {
        "id": "m0000000-0000-0000-0000-000000000003",
        "creator_id": "c1000000-0000-0000-0000-000000000002",
        "name": "하늘",
        "description": "역동적이고 활기찬 스포츠웨어 전문 AI 모델입니다. 애슬레저, 스포츠 브랜드 캠페인에 적합합니다.",
        "style": "sporty",
        "gender": "female",
        "age_range": "20s",
        "view_count": 2341,
        "rating": 4.9,
        "status": "active",
        "tags": ["스포티", "애슬레저", "헬스", "액티브"],
        "images": [
            {"file": "사진_010_0010.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_011_0011.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_012_0012.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_013_0013.png", "order": 4, "is_thumbnail": False},
            {"file": "사진_014_0014.png", "order": 5, "is_thumbnail": False},
        ],
    },
    # Model 4: 빈티지 여성 20대
    {
        "id": "m0000000-0000-0000-0000-000000000004",
        "creator_id": "c1000000-0000-0000-0000-000000000002",
        "name": "민서",
        "description": "클래식하고 레트로한 감성의 AI 모델입니다. 빈티지 패션, 레트로 무드 촬영에 어울립니다.",
        "style": "vintage",
        "gender": "female",
        "age_range": "20s",
        "view_count": 876,
        "rating": 4.5,
        "status": "active",
        "tags": ["빈티지", "레트로", "클래식", "올드스쿨"],
        "images": [
            {"file": "사진_015_0015.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_016_0016.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_017_0017.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_018_0018.png", "order": 4, "is_thumbnail": False},
        ],
    },
    # Model 5: 캐주얼 남성 20대
    {
        "id": "m0000000-0000-0000-0000-000000000005",
        "creator_id": "c1000000-0000-0000-0000-000000000003",
        "name": "준호",
        "description": "모던하고 깔끔한 남성 캐주얼 AI 모델입니다. 남성복, 스트릿웨어 브랜드에 적합합니다.",
        "style": "casual",
        "gender": "male",
        "age_range": "20s",
        "view_count": 1245,
        "rating": 4.7,
        "status": "active",
        "tags": ["캐주얼", "스트릿", "남성복", "모던"],
        "images": [
            {"file": "사진_019_0019.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_020_0020.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_021_0021.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_022_0022.png", "order": 4, "is_thumbnail": False},
            {"file": "사진_023_0023.png", "order": 5, "is_thumbnail": False},
        ],
    },
    # Model 6: 포멀 남성 30대
    {
        "id": "m0000000-0000-0000-0000-000000000006",
        "creator_id": "c1000000-0000-0000-0000-000000000003",
        "name": "현우",
        "description": "품격있고 전문적인 비즈니스 남성 AI 모델입니다. 정장, 수트 화보에 최적화되어 있습니다.",
        "style": "formal",
        "gender": "male",
        "age_range": "30s",
        "view_count": 654,
        "rating": 4.4,
        "status": "active",
        "tags": ["포멀", "정장", "비즈니스", "프로페셔널"],
        "images": [
            {"file": "사진_024_0024.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_025_0025.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_026_0026.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_027_0027.png", "order": 4, "is_thumbnail": False},
        ],
    },
    # Model 7: 스포티 남성 20대
    {
        "id": "m0000000-0000-0000-0000-000000000007",
        "creator_id": "c1000000-0000-0000-0000-000000000004",
        "name": "태민",
        "description": "건강하고 활력있는 스포츠 남성 AI 모델입니다. 스포츠웨어, 피트니스 브랜드에 어울립니다.",
        "style": "sporty",
        "gender": "male",
        "age_range": "20s",
        "view_count": 1876,
        "rating": 4.8,
        "status": "active",
        "tags": ["스포티", "피트니스", "액티브", "헬시"],
        "images": [
            {"file": "사진_028_0028.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_029_0029.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_030_0030.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_031_0031.png", "order": 4, "is_thumbnail": False},
            {"file": "사진_032_0032.png", "order": 5, "is_thumbnail": False},
        ],
    },
    # Model 8: 캐주얼 여성 10대
    {
        "id": "m0000000-0000-0000-0000-000000000008",
        "creator_id": "c1000000-0000-0000-0000-000000000004",
        "name": "지우",
        "description": "발랄하고 귀여운 10대 감성의 AI 모델입니다. 영캐주얼, Z세대 타겟 브랜드에 적합합니다.",
        "style": "casual",
        "gender": "female",
        "age_range": "10s",
        "view_count": 2103,
        "rating": 4.7,
        "status": "active",
        "tags": ["영캐주얼", "Z세대", "발랄", "큐트"],
        "images": [
            {"file": "사진_033_0033.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_034_0034.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_035_0035.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_036_0036.png", "order": 4, "is_thumbnail": False},
        ],
    },
    # Model 9: 빈티지 여성 30대
    {
        "id": "m0000000-0000-0000-0000-000000000009",
        "creator_id": "c1000000-0000-0000-0000-000000000001",
        "name": "서연",
        "description": "고급스럽고 우아한 빈티지 감성 AI 모델입니다. 럭셔리 브랜드, 하이엔드 패션에 어울립니다.",
        "style": "vintage",
        "gender": "female",
        "age_range": "30s",
        "view_count": 743,
        "rating": 4.6,
        "status": "active",
        "tags": ["빈티지", "럭셔리", "하이엔드", "엘레강스"],
        "images": [
            {"file": "사진_037_0037.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_038_0038.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_039_0039.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_040_0040.png", "order": 4, "is_thumbnail": False},
            {"file": "사진_040_0041.png", "order": 5, "is_thumbnail": False},
        ],
    },
    # Model 10: 캐주얼 여성 20대 (뉴페이스)
    {
        "id": "m0000000-0000-0000-0000-000000000010",
        "creator_id": "c1000000-0000-0000-0000-000000000002",
        "name": "예은",
        "description": "신선하고 트렌디한 MZ세대 감성 AI 모델입니다. 인스타그램, SNS 마케팅에 최적화되어 있습니다.",
        "style": "casual",
        "gender": "female",
        "age_range": "20s",
        "view_count": 3201,
        "rating": 4.9,
        "status": "active",
        "tags": ["MZ세대", "인스타", "트렌디", "바이럴"],
        "images": [
            {"file": "사진_041_0042.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_041_0043.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_042_0044.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_042_0045.png", "order": 4, "is_thumbnail": False},
        ],
    },
    # Model 11: 포멀 여성 40대+
    {
        "id": "m0000000-0000-0000-0000-000000000011",
        "creator_id": "c1000000-0000-0000-0000-000000000003",
        "name": "미경",
        "description": "성숙하고 품위있는 시니어 AI 모델입니다. 프리미엄 브랜드, 시니어 타겟 패션에 적합합니다.",
        "style": "formal",
        "gender": "female",
        "age_range": "40s+",
        "view_count": 421,
        "rating": 4.5,
        "status": "active",
        "tags": ["시니어", "프리미엄", "품위", "클래식"],
        "images": [
            {"file": "사진_043_0046.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_044_0047.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_044_0048.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_045_0049.png", "order": 4, "is_thumbnail": False},
        ],
    },
    # Model 12: 스포티 남성 10대
    {
        "id": "m0000000-0000-0000-0000-000000000012",
        "creator_id": "c1000000-0000-0000-0000-000000000004",
        "name": "민준",
        "description": "에너지 넘치는 10대 스포츠 AI 모델입니다. 스쿨룩, 청소년 스포츠 브랜드에 어울립니다.",
        "style": "sporty",
        "gender": "male",
        "age_range": "10s",
        "view_count": 1532,
        "rating": 4.6,
        "status": "active",
        "tags": ["스포티", "스쿨룩", "청소년", "에너지"],
        "images": [
            {"file": "사진_046_0050.png", "order": 1, "is_thumbnail": True},
            {"file": "사진_047_0051.png", "order": 2, "is_thumbnail": False},
            {"file": "사진_048_0052.png", "order": 3, "is_thumbnail": False},
            {"file": "사진_049_0053.png", "order": 4, "is_thumbnail": False},
            {"file": "사진_050_0054.png", "order": 5, "is_thumbnail": False},
            {"file": "사진_051_0055.png", "order": 6, "is_thumbnail": False},
            {"file": "사진_052_0056.png", "order": 7, "is_thumbnail": False},
        ],
    },
]


def build_image_url(filename: str) -> str:
    """Build full image URL from filename."""
    return f"{IMAGE_BASE_PATH}/{filename}"


def get_thumbnail_url(model: dict) -> str | None:
    """Get thumbnail URL for a model."""
    for img in model.get("images", []):
        if img.get("is_thumbnail"):
            return build_image_url(img["file"])
    return None


def generate_model_images(model: dict) -> list[dict]:
    """Generate ModelImage records for a model."""
    model_id = model["id"]
    result = []
    for img in model.get("images", []):
        result.append({
            "id": str(uuid.uuid4()),
            "model_id": model_id,
            "image_url": build_image_url(img["file"]),
            "display_order": img["order"],
            "is_thumbnail": img["is_thumbnail"],
        })
    return result


def generate_model_tags(model: dict) -> list[dict]:
    """Generate ModelTag records for a model."""
    model_id = model["id"]
    result = []
    for tag in model.get("tags", []):
        result.append({
            "id": str(uuid.uuid4()),
            "model_id": model_id,
            "tag": tag,
        })
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Seed functions
# ─────────────────────────────────────────────────────────────────────────────

async def seed_users(session):
    """Seed mock users (creators and brands)."""
    from app.models.user import User
    from app.core.security import get_password_hash

    all_users = MOCK_CREATORS + MOCK_BRANDS
    for user_data in all_users:
        user = User(
            id=user_data["id"],
            email=user_data["email"],
            password_hash=get_password_hash("password123"),
            nickname=user_data["nickname"],
            role=user_data["role"],
            profile_image=user_data.get("profile_image"),
            company_name=user_data.get("company_name"),
        )
        session.add(user)
    await session.commit()
    print(f"✓ Created {len(all_users)} users")


async def seed_ai_models(session):
    """Seed mock AI models with images and tags."""
    from app.models.ai_model import AIModel, ModelImage, ModelTag

    for model_data in MOCK_AI_MODELS:
        # Create AI Model
        model = AIModel(
            id=model_data["id"],
            creator_id=model_data["creator_id"],
            name=model_data["name"],
            description=model_data["description"],
            style=model_data["style"],
            gender=model_data["gender"],
            age_range=model_data["age_range"],
            view_count=model_data["view_count"],
            rating=model_data["rating"],
            status=model_data["status"],
        )
        session.add(model)

        # Create Images
        for img_data in generate_model_images(model_data):
            image = ModelImage(
                id=img_data["id"],
                model_id=img_data["model_id"],
                image_url=img_data["image_url"],
                display_order=img_data["display_order"],
                is_thumbnail=img_data["is_thumbnail"],
            )
            session.add(image)

        # Create Tags
        for tag_data in generate_model_tags(model_data):
            tag = ModelTag(
                id=tag_data["id"],
                model_id=tag_data["model_id"],
                tag=tag_data["tag"],
            )
            session.add(tag)

    await session.commit()
    print(f"✓ Created {len(MOCK_AI_MODELS)} AI models with images and tags")


async def seed_all():
    """Run all seed functions."""
    from app.db.session import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        print("Seeding database...")
        await seed_users(session)
        await seed_ai_models(session)
        print("✓ Database seeding complete!")


if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_all())
