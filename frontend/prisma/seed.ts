import { prisma } from "../lib/prisma";

function rubToCents(rub: number) {
  return Math.round(rub * 100);
}

async function main() {
  const products = [
    {
      name: "Noir Velvet",
      description: "Глубокий, бархатный аромат с тёплым шлейфом. Идеален для вечера и уверенного впечатления.",
      priceCents: rubToCents(3290),
      imageUrl: "https://source.unsplash.com/featured/900x900/?perfume,noir,velvet&sig=11"
    },
    {
      name: "Amber Essence",
      description: "Солнечно-янтарный характер: мягкие древесные ноты и нежная сладость. Лёгкий и притягательный.",
      priceCents: rubToCents(2790),
      imageUrl: "https://source.unsplash.com/featured/900x900/?perfume,amber,essence&sig=22"
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: { description: p.description, price: p.priceCents, imageUrl: p.imageUrl },
      create: {
        name: p.name,
        description: p.description,
        price: p.priceCents,
        imageUrl: p.imageUrl
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

