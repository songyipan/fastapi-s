"""向 category / product / product_category / sku 表写入演示数据。

运行方式（项目根目录）：
    uv run --package web-service python apps/web-service/scripts/seed_products.py
    uv run --package web-service python apps/web-service/scripts/seed_products.py --force
"""

import argparse
import asyncio
from decimal import Decimal

from dotenv import load_dotenv
from sqlalchemy import delete, func, select, text

load_dotenv()

from app.core.database import get_session_factory  # noqa: E402
from app.model.association import product_category  # noqa: E402
from app.model.category import Category  # noqa: E402
from app.model.product import Product  # noqa: E402
from app.model.sku import Sku  # noqa: E402
from app.schema.category import CategoryCreate  # noqa: E402
from app.schema.product import ProductCreate  # noqa: E402
from app.schema.sku import SkuCreate  # noqa: E402
from app.service.category_service import CategoryService  # noqa: E402
from app.service.product_service import ProductService  # noqa: E402
from app.service.sku_service import SkuService  # noqa: E402


async def _clear_product_data(session) -> None:
    await session.execute(delete(Sku))
    await session.execute(delete(product_category))
    await session.execute(delete(Product))
    await session.execute(delete(Category))
    await session.execute(text("ALTER SEQUENCE IF EXISTS sku_id_seq RESTART WITH 1"))
    await session.execute(text("ALTER SEQUENCE IF EXISTS product_id_seq RESTART WITH 1"))
    await session.execute(text("ALTER SEQUENCE IF EXISTS category_id_seq RESTART WITH 1"))
    await session.flush()


async def _product_count(session) -> int:
    result = await session.execute(select(func.count()).select_from(Product))
    return result.scalar_one()


async def seed(*, force: bool = False) -> None:
    async with get_session_factory()() as session:
        count = await _product_count(session)
        if count > 0 and not force:
            print(f"已有 {count} 个商品，跳过写入。使用 --force 清空后重新导入。")
            return

        if force and count > 0:
            print("清空现有商品相关数据...")
            await _clear_product_data(session)

        category_svc = CategoryService(session)
        product_svc = ProductService(session)
        sku_svc = SkuService(session)

        c_electronics = await category_svc.create_category(
            CategoryCreate(name="电子产品", description="手机、电脑、耳机等数码产品")
        )
        c_books = await category_svc.create_category(
            CategoryCreate(name="图书", description="技术、文学、教育类图书")
        )
        c_clothing = await category_svc.create_category(
            CategoryCreate(name="服装", description="男装、女装、运动服饰")
        )

        p_iphone = await product_svc.create_product(
            ProductCreate(
                name="iPhone 16",
                description="苹果最新款智能手机，A18 芯片，支持灵动岛与 Pro 级影像系统。",
                brand="Apple",
                category_ids=[c_electronics.id],
            )
        )
        p_macbook = await product_svc.create_product(
            ProductCreate(
                name="MacBook Pro",
                description="2024 款 MacBook Pro，M3 芯片，适合开发与创意设计。",
                brand="Apple",
                category_ids=[c_electronics.id],
            )
        )
        p_airpods = await product_svc.create_product(
            ProductCreate(
                name="AirPods Pro",
                description="主动降噪无线耳机，空间音频，MagSafe 充电盒。",
                brand="Apple",
                category_ids=[c_electronics.id],
            )
        )
        p_python_book = await product_svc.create_product(
            ProductCreate(
                name="Python 入门教程",
                description="零基础学 Python，涵盖语法、面向对象与常用库。",
                brand="人民邮电出版社",
                category_ids=[c_books.id],
            )
        )
        p_tshirt = await product_svc.create_product(
            ProductCreate(
                name="纯棉圆领 T 恤",
                description="100% 纯棉，透气舒适，多色可选。",
                brand="优衣库",
                category_ids=[c_clothing.id],
            )
        )

        sku_data = [
            (
                p_iphone.id,
                SkuCreate(
                    sku_code="IP16-128-BLK",
                    price=Decimal("6999.00"),
                    stock=100,
                    attrs={"颜色": "黑色", "存储": "128G"},
                    image_url="https://picsum.photos/seed/ip16-blk/400/400",
                ),
            ),
            (
                p_iphone.id,
                SkuCreate(
                    sku_code="IP16-256-WHT",
                    price=Decimal("7999.00"),
                    stock=50,
                    attrs={"颜色": "白色", "存储": "256G"},
                    image_url="https://picsum.photos/seed/ip16-wht/400/400",
                ),
            ),
            (
                p_macbook.id,
                SkuCreate(
                    sku_code="MBP14-M3-16G",
                    price=Decimal("12999.00"),
                    stock=30,
                    attrs={"尺寸": "14 寸", "芯片": "M3", "内存": "16G"},
                    image_url="https://picsum.photos/seed/mbp14/400/400",
                ),
            ),
            (
                p_airpods.id,
                SkuCreate(
                    sku_code="APP2-WHT",
                    price=Decimal("1899.00"),
                    stock=200,
                    attrs={"颜色": "白色", "版本": "第二代"},
                    image_url="https://picsum.photos/seed/airpods/400/400",
                ),
            ),
            (
                p_python_book.id,
                SkuCreate(
                    sku_code="PY-BOOK-001",
                    price=Decimal("59.00"),
                    stock=500,
                    attrs={"版本": "第 3 版", "装帧": "平装"},
                    image_url="https://picsum.photos/seed/python-book/400/400",
                ),
            ),
            (
                p_tshirt.id,
                SkuCreate(
                    sku_code="TSHIRT-M-BLU",
                    price=Decimal("99.00"),
                    stock=300,
                    attrs={"尺码": "M", "颜色": "蓝色"},
                    image_url="https://picsum.photos/seed/tshirt-blu/400/400",
                ),
            ),
            (
                p_tshirt.id,
                SkuCreate(
                    sku_code="TSHIRT-L-WHT",
                    price=Decimal("99.00"),
                    stock=250,
                    attrs={"尺码": "L", "颜色": "白色"},
                    image_url="https://picsum.photos/seed/tshirt-wht/400/400",
                ),
            ),
        ]

        for product_id, sku_create in sku_data:
            await sku_svc.create_sku(product_id, sku_create)

        await session.commit()

        print("演示数据写入完成：")
        print(f"  分类: 3 个（电子产品、图书、服装）")
        print(f"  商品: 5 个")
        print(f"  SKU:  {len(sku_data)} 个")


def main() -> None:
    parser = argparse.ArgumentParser(description="写入商品域演示数据")
    parser.add_argument(
        "--force",
        action="store_true",
        help="清空 category/product/sku 相关表后重新导入",
    )
    args = parser.parse_args()
    asyncio.run(seed(force=args.force))


if __name__ == "__main__":
    main()
